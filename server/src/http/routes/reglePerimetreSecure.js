const express = require("express");
const Joi = require("joi");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const Boom = require("boom");
const { ReglePerimetre } = require("../../common/model");
const { diffFormation, buildUpdatesHistory } = require("../../logic/common/utils/diffUtils");

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
  duree: Joi.number().allow(null),
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
  duree: Joi.number().allow(null),
}).unknown();

/**
 * Ensure user can edit perimeter rules
 */
const hasPerimeterRights = (user, plateforme) => {
  return (
    (plateforme === "affelnet" && user.acl?.includes("page_perimetre_af")) ||
    (plateforme === "parcoursup" && user.acl?.includes("page_perimetre_ps"))
  );
};

module.exports = () => {
  const router = express.Router();

  // Create
  router.post(
    "/perimetre/regle",
    tryCatch(async ({ body, user }, res) => {
      await createSchema.validateAsync(body, { abortEarly: false });

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
      } = body;

      if (!hasPerimeterRights(user, plateforme)) {
        throw Boom.unauthorized();
      }

      // TODO @EPT handle num_academie and is_regle_nationale

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
      });

      await regle.save();
      return res.json(regle);
    })
  );

  router.put(
    "/perimetre/regle/:id",
    tryCatch(async ({ params, body, user }, res) => {
      await updateSchema.validateAsync(body, { abortEarly: false });
      const id = params.id;
      if (!id) {
        throw Boom.badRequest();
      }

      const { plateforme } = body;

      if (plateforme && !hasPerimeterRights(user, plateforme)) {
        throw Boom.unauthorized();
      }

      const rule = await ReglePerimetre.findById(id).lean();
      if (!rule) {
        throw Boom.notFound();
      }

      if (!hasPerimeterRights(user, rule.plateforme)) {
        throw Boom.unauthorized();
      }

      const updatedRule = {
        ...rule,
        ...body,
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
    tryCatch(async ({ params, user }, res) => {
      const id = params.id;
      if (!id) {
        throw Boom.badRequest();
      }

      const rule = await ReglePerimetre.findById(id).lean();
      if (!rule) {
        throw Boom.notFound();
      }

      if (!hasPerimeterRights(user, rule.plateforme)) {
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
