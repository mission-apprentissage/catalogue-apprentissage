const express = require("express");
const Joi = require("joi");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const Boom = require("boom");
const { ReglePerimetre } = require("../../common/model");
const { diffFormation, buildUpdatesHistory } = require("../../logic/common/utils/diffUtils");
const { sanitize } = require("../../common/utils/sanitizeUtils");

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
  "hors périmètre",
  "publié",
  "non publié",
  "à publier (sous condition habilitation)",
  "à publier (vérifier accès direct postbac)",
  "à publier (soumis à validation Recteur)",
  "à publier (soumis à validation)",
  "à publier",
  "en attente de publication"
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
    (plateforme === "affelnet" && user.acl?.includes("page_perimetre_af")) ||
    (plateforme === "parcoursup" && user.acl?.includes("page_perimetre_ps"))
  );
};

const hasAcademyRights = (user, { num_academie }, payload) => {
  const userAcademies = user.academie.split(",");
  const hasAllAcademies = user.isAdmin || userAcademies.includes("-1");

  if (!num_academie) {
    const isEditingStatusOnly = payload && Object.keys(payload).length === 1 && !!payload.statut_academies;
    return hasAllAcademies || isEditingStatusOnly;
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

      const { plateforme } = payload;

      if (plateforme && !hasPerimeterRights(user, plateforme)) {
        throw Boom.unauthorized();
      }

      const rule = await ReglePerimetre.findById(id).lean();
      if (!rule) {
        throw Boom.notFound();
      }

      if (!hasPerimeterRights(user, rule.plateforme) || !hasAcademyRights(user, rule, payload)) {
        throw Boom.unauthorized();
      }

      const updatedRule = {
        ...rule,
        ...payload,
        last_update_who: user.email,
        last_update_at: Date.now(),
      };

      // add entry in updates history
      const { updates, keys } = diffFormation(rule, updatedRule);
      if (updates) {
        updatedRule.updates_history = buildUpdatesHistory(rule, updates, keys);
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

      const rule = await ReglePerimetre.findById(id).lean();
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
      const { updates, keys } = diffFormation(rule, updatedRule);
      if (updates) {
        updatedRule.updates_history = buildUpdatesHistory(rule, updates, keys);
      }

      const deleted = await ReglePerimetre.findByIdAndUpdate(id, updatedRule, { new: true });
      return res.json(deleted);
    })
  );

  return router;
};
