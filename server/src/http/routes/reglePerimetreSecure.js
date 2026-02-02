const express = require("express");
const Joi = require("joi");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const Boom = require("boom");
const { ReglePerimetre } = require("../../common/models");
const { diffReglePerimetre, buildUpdatesHistory } = require("../../logic/common/utils/diffUtils");
const { sanitize } = require("../../common/utils/sanitizeUtils");
const { AFFELNET_STATUS, COMMON_STATUS, PARCOURSUP_STATUS } = require("../../constants/status");
const logger = require("../../common/logger");
const { hasAccessTo, hasAcademyRight } = require("../../common/utils/rolesUtils");

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

const updateStatutAcademiesSchema = Joi.object({
  statut: statutSchema,
}).unknown();

/**
 * Ensure user can add perimeter rules
 */
const hasPerimeterPlateformeCreateRight = (user = {}, plateforme) => {
  return (
    user.isAdmin ||
    (plateforme === "affelnet" && hasAccessTo(user, "page_perimetre/affelnet-add-rule")) ||
    (plateforme === "parcoursup" && hasAccessTo(user, "page_perimetre/parcoursup-add-rule"))
  );
};

/**
 * Ensure user can edit perimeter rules
 */
const hasPerimeterPlateformeEditRight = (user = {}, plateforme) => {
  return (
    user.isAdmin ||
    (plateforme === "affelnet" && hasAccessTo(user, "page_perimetre/affelnet-edit-rule")) ||
    (plateforme === "parcoursup" && hasAccessTo(user, "page_perimetre/parcoursup-edit-rule"))
  );
};

/**
 * Ensure user can edit academy rules
 */
const hasStatutAcademieRight = (user, { num_academie, statut_academies }, payload) => {
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

      const user = req.session?.passport?.user;

      logger.info({ type: "http" }, "Create perimeter rule", { user, payload });

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

      if (!hasPerimeterPlateformeCreateRight(user, plateforme)) {
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

      const user = req.session?.passport?.user;

      const id = sanitizedParams.id;
      if (!id) {
        throw Boom.badRequest();
      }

      logger.info({ type: "http" }, "Update perimeter rule", { user, id, payload });

      await updateSchema.validateAsync(payload, { abortEarly: false });

      const rule = await ReglePerimetre.findById(id, { updates_history: 0 }).lean();

      if (!rule) {
        throw Boom.notFound();
      }

      if (!(hasPerimeterPlateformeEditRight(user, rule.plateforme) && hasStatutAcademieRight(user, rule, payload))) {
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

  router.patch(
    "/perimetre/regle/:id/:num_academie",
    tryCatch(async (req, res) => {
      const payload = sanitize(req.body);
      const sanitizedParams = sanitize(req.params);

      const user = req.session?.passport?.user;

      const { id, num_academie } = sanitizedParams;
      if (!id || !num_academie) {
        throw Boom.badRequest();
      }

      logger.info({ type: "http" }, "Update perimeter rule for academie", { user, id, num_academie, payload });

      await updateStatutAcademiesSchema.validateAsync(payload, { abortEarly: false });

      const rule = await ReglePerimetre.findById(id, { updates_history: 0 }).lean();

      if (!rule) {
        throw Boom.notFound();
      }

      if (
        !(hasPerimeterPlateformeRight(user, rule.plateforme) && (user.isAdmin || hasAcademyRight(user, num_academie)))
      ) {
        throw Boom.unauthorized();
      }

      const updatedRule = {
        ...rule,
        statut_academies: { ...rule.statut_academies, [num_academie]: payload.statut },
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
    "/perimetre/regle/:id/:num_academie",
    tryCatch(async (req, res) => {
      const sanitizedParams = sanitize(req.params);

      const user = req.session?.passport?.user;

      const { id, num_academie } = sanitizedParams;
      if (!id || !num_academie) {
        throw Boom.badRequest();
      }

      logger.info({ type: "http" }, "Delete perimeter rule for academie", { user, id, num_academie });

      const rule = await ReglePerimetre.findById(id, { updates_history: 0 }).lean();

      if (!rule) {
        throw Boom.notFound();
      }

      if (
        !(hasPerimeterPlateformeRight(user, rule.plateforme) && (user.isAdmin || hasAcademyRight(user, num_academie)))
      ) {
        throw Boom.unauthorized();
      }

      const { [num_academie]: previousAcademieStatut, ...statutAcademies } = rule.statut_academies;

      const updatedRule = {
        ...rule,
        statut_academies: statutAcademies,
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

      const user = req.session?.passport?.user;

      const id = sanitizedParams.id;
      if (!id) {
        throw Boom.badRequest();
      }

      logger.info({ type: "http" }, "Delete perimeter rule", { user, id });

      const rule = await ReglePerimetre.findById(id, { updates_history: 0 }).lean();
      if (!rule) {
        throw Boom.notFound();
      }

      if (!hasPerimeterPlateformeRight(user, rule.plateforme) || !hasStatutAcademieRight(user, rule)) {
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
