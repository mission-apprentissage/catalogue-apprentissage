const express = require("express");
const Joi = require("joi");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const Boom = require("boom");
const { ReglePerimetre } = require("../../common/models");
const { diffReglePerimetre, buildUpdatesHistory } = require("../../logic/common/utils/diffUtils");
const { sanitize } = require("../../common/utils/sanitizeUtils");
const { AFFELNET_STATUS, COMMON_STATUS, PARCOURSUP_STATUS } = require("../../constants/status");

/**
 * Schema for validation
 */
const plateformeSchema = Joi.string().valid("affelnet", "parcoursup");
const niveauSchema = Joi.string().valid(
  "3 (CAP...)",
  "4 (BAC...)",
  "5 (BTS, DEUST...)",
  "6 (Licence, BUT...)",
  "7 (Master, titre ingénieur...)"
);
const statutSchema = Joi.string().valid(
  COMMON_STATUS.NON_PUBLIABLE_EN_LETAT,
  COMMON_STATUS.PUBLIE,
  COMMON_STATUS.NON_PUBLIE,
  PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
  PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
  PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
  AFFELNET_STATUS.A_PUBLIER_VALIDATION,
  AFFELNET_STATUS.A_DEFINIR,
  COMMON_STATUS.A_PUBLIER
);

const conditionSchema = Joi.string().valid("doit intégrer", "peut intégrer", "ne doit pas intégrer");

const createSchema = Joi.object({
  plateforme: plateformeSchema.required(),
  niveau: niveauSchema.required(),
  diplome: Joi.string().required(),
  statut: statutSchema.required(),
  regle_complementaire: Joi.string(),
  regle_complementaire_query: Joi.string(),
  nom_regle_complementaire: Joi.string(),
  condition_integration: conditionSchema.required(),
  duree: Joi.string().allow(null),
  annee: Joi.string().allow(null),
  statut_academies: Joi.object().allow(null),
  num_academie: Joi.number().allow(null),
}).unknown();

const updateSchema = Joi.object({
  plateforme: plateformeSchema,
  niveau: niveauSchema,
  diplome: Joi.string(),
  statut: statutSchema,
  regle_complementaire: Joi.string(),
  regle_complementaire_query: Joi.string(),
  nom_regle_complementaire: Joi.string(),
  condition_integration: conditionSchema,
  duree: Joi.string().allow(null),
  annee: Joi.string().allow(null),
  statut_academies: Joi.object().allow(null),
}).unknown();

/**
 * Ensure user can edit perimeter rules
 */
const hasPerimeterRights = (user = {}, plateforme) => {
  return (
    user.isAdmin ||
    (plateforme === "affelnet" && user.acl?.includes("page_perimetre/affelnet")) ||
    (plateforme === "parcoursup" && user.acl?.includes("page_perimetre/parcoursup"))
  );
};

/**
 * Ensure user can edit academy rules
 */
const hasAcademyRights = (user, { num_academie, statut_academies }, payload) => {
  const userAcademies = user.academie.split(",");
  const hasAllAcademies = user.isAdmin || userAcademies.includes("-1");

  if (payload?.statut_academies) {
    const newAcademies = Object.keys(statut_academies || {});
    const oldAcademies = Object.keys(payload?.statut_academies || {});

    const diffAcademies = newAcademies
      .filter((x) => !oldAcademies.includes(x) || statut_academies[x] !== payload.statut_academies[x])
      .concat(
        oldAcademies.filter((x) => !newAcademies.includes(x) || statut_academies[x] !== payload.statut_academies[x])
      );

    if (diffAcademies.length > 0) {
      return (
        hasAllAcademies ||
        diffAcademies.every((diffAcademy) => userAcademies.includes(`${diffAcademy}`.padStart(2, "0")))
      );
    }
  }

  return hasAllAcademies || userAcademies.includes(`${num_academie}`.padStart(2, "0"));
};

module.exports = () => {
  const router = express.Router();

  // Create
  router.post(
    "/perimetre/regle",
    tryCatch(async (req, res) => {
      const payload = sanitize(req.body);

      let user = {};
      if (req.user) {
        user = req.session?.passport?.user;
      }

      await createSchema.validateAsync(payload, { abortEarly: false });

      const {
        plateforme,
        niveau,
        diplome,
        statut,
        regle_complementaire,
        regle_complementaire_query,
        nom_regle_complementaire,
        condition_integration,
        duree,
        annee,
        statut_academies,
        num_academie,
      } = payload;

      if (!hasPerimeterRights(user, plateforme)) {
        throw Boom.unauthorized();
      }

      const regle = new ReglePerimetre({
        plateforme,
        niveau,
        diplome,
        statut,
        regle_complementaire,
        regle_complementaire_query,
        nom_regle_complementaire: nom_regle_complementaire || null,
        last_update_who: user.email,
        condition_integration,
        duree,
        annee,
        statut_academies: statut_academies ?? {},
        num_academie,
      });

      await regle.save();
      return res.json(regle);
    })
  );

  router.put(
    "/perimetre/regle/:id",
    tryCatch(async (req, res) => {
      const payload = sanitize(req.body);
      const sanitizedParams = sanitize(req.params);

      let user = {};
      if (req.user) {
        user = req.session?.passport?.user;
      }

      await updateSchema.validateAsync(payload, { abortEarly: false });
      const id = sanitizedParams.id;
      if (!id) {
        throw Boom.badRequest();
      }

      const rule = await ReglePerimetre.findById(id, { updates_history: 0 }).lean();

      if (!rule) {
        throw Boom.notFound();
      }

      if (!(hasPerimeterRights(user, rule.plateforme) && hasAcademyRights(user, rule, payload))) {
        throw Boom.unauthorized();
      }

      const updatedRule = {
        ...rule,
        ...payload,
        last_update_who: user.email,
        last_update_at: Date.now(),
      };

      // add entry in updates history
      const { updates, keys } = diffReglePerimetre(rule, updatedRule);
      if (updates) {
        updatedRule.$push = {
          updates_history: buildUpdatesHistory(rule, updates, keys),
        };
      }

      const updated = await ReglePerimetre.findByIdAndUpdate(id, updatedRule, { new: true });
      return res.json(updated);
    })
  );

  router.delete(
    "/perimetre/regle/:id",
    tryCatch(async (req, res) => {
      const sanitizedParams = sanitize(req.params);

      let user = {};
      if (req.user) {
        user = req.session?.passport?.user;
      }

      const id = sanitizedParams.id;
      if (!id) {
        throw Boom.badRequest();
      }

      const rule = await ReglePerimetre.findById(id, { updates_history: 0 }).lean();
      if (!rule) {
        throw Boom.notFound();
      }

      if (!hasPerimeterRights(user, rule.plateforme) || !hasAcademyRights(user, rule)) {
        throw Boom.unauthorized();
      }

      const updatedRule = {
        ...rule,
        last_update_who: user.email,
        last_update_at: Date.now(),
        is_deleted: true, // soft delete
      };

      // add entry in updates history
      const { updates, keys } = diffReglePerimetre(rule, updatedRule);
      if (updates) {
        updatedRule.$push = {
          updates_history: buildUpdatesHistory(rule, updates, keys),
        };
      }

      const deleted = await ReglePerimetre.findByIdAndUpdate(id, updatedRule, { new: true });
      return res.json(deleted);
    })
  );

  return router;
};
