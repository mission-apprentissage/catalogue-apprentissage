const express = require("express");
const Joi = require("joi");
const { CandidatureRelation, Formation } = require("../../common/models");
const { siretFormat } = require("../../common/models/format");
const logger = require("../../common/logger");
const { hasAccessTo } = require("../../common/utils/rolesUtils");

module.exports = () => {
  const router = express.Router();

  const updateRelatedFormations = async (candidatureRelation, filter) => {
    for (formation of await Formation.find({ published: true, ...filter })) {
      let affelnet_candidature_status = null;

      switch (true) {
        case formation.affelnet_perimetre && !candidatureRelation:
          affelnet_candidature_status = "Offres non concernées (nouveaux organismes)";
          break;
        case formation.affelnet_perimetre &&
          candidatureRelation.statut_diffusion_generique === "✅ Candidatures toutes téléchargées":
          affelnet_candidature_status = "Candidatures téléchargées";
          break;
        case formation.affelnet_perimetre &&
          candidatureRelation.statut_diffusion_generique === "⚠️ Mise à jour non téléchargée":
          affelnet_candidature_status = "Candidatures partiellement téléchargées";
          break;
        case formation.affelnet_perimetre &&
          candidatureRelation.statut_diffusion_generique === "⚠️ Candidatures non téléchargées":
          affelnet_candidature_status = candidatureRelation.intervention_since_last_session
            ? "Candidatures non téléchargées, avec modification de contact effectuée depuis"
            : "Candidatures non téléchargées, sans modification de contact effectuée depuis";
      }

      await Formation.updateOne(
        { _id: formation._id },
        { $set: { affelnet_candidature_status } },
        { returnDocument: "after" }
      );
    }
  };

  /**
   * GET /candidature/relation - Get a relation by responsable and formateur sirets
   */
  router.get("/candidature/relation", async (req, res) => {
    const user = req.user;

    const isAuthorized = hasAccessTo(user, "page_other/api_candidature_relation_find");

    if (!isAuthorized) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à accéder à cette ressource." });
    }

    const { siret_responsable, siret_formateur } = await Joi.object({
      siret_responsable: Joi.string().regex(siretFormat).default(null).required(),
      siret_formateur: Joi.string().regex(siretFormat).default(null).required(),
    }).validateAsync(req.query, { abortEarly: false });

    logger.info({ type: "http" }, "Intervention effectuée sur la relation ", { siret_responsable, siret_formateur });

    const count = await CandidatureRelation.countDocuments({ siret_responsable, siret_formateur });

    if (!count) {
      return res
        .status(404)
        .json({ message: `Aucune relation ne correspond aux sirets : ${siret_responsable} / ${siret_formateur}` });
    }

    const candidatureRelation = await CandidatureRelation.findOne({ siret_responsable, siret_formateur });

    res.json(candidatureRelation);
  });

  /**
   * PUT /candidature/relation - Mark a relation as having an intervention since last session
   */
  router.put("/candidature/relation", async (req, res) => {
    const user = req.user;

    const isAuthorized = hasAccessTo(user, "page_other/api_candidature_relation_update");

    if (!isAuthorized) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à accéder à cette ressource." });
    }

    const { siret_responsable, siret_formateur } = await Joi.object({
      siret_responsable: Joi.string().regex(siretFormat).default(null).required(),
      siret_formateur: Joi.string().regex(siretFormat).default(null).required(),
    }).validateAsync(req.query, { abortEarly: false });

    logger.info({ type: "http" }, "Intervention effectuée sur la relation ", { siret_responsable, siret_formateur });

    const count = await CandidatureRelation.countDocuments({ siret_responsable, siret_formateur });

    if (!count) {
      return res
        .status(404)
        .json({ message: `Aucune relation ne correspond aux sirets : ${siret_responsable} / ${siret_formateur}` });
    }

    await CandidatureRelation.updateOne(
      { siret_responsable, siret_formateur },
      { $set: { intervention_since_last_session: true } },
      { returnDocument: "after" }
    );

    const candidatureRelation = await CandidatureRelation.findOne({ siret_responsable, siret_formateur });

    await updateRelatedFormations(candidatureRelation, {
      etablissement_gestionnaire_siret: siret_responsable,
      etablissement_formateur_siret: siret_formateur,
    });

    res.json({ data: candidatureRelation, message: "Candidature relation updated" });
  });

  /**
   * GET /candidature/relations - Get all relations for a responsable siret
   */
  router.get("/candidature/relations", async (req, res) => {
    const user = req.user;

    const isAuthorized = hasAccessTo(user, "page_other/api_candidature_relation_find");

    if (!isAuthorized) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à accéder à cette ressource." });
    }

    const { siret_responsable } = await Joi.object({
      siret_responsable: Joi.string().regex(siretFormat).default(null).required(),
    }).validateAsync(req.query, { abortEarly: false });

    logger.info({ type: "http" }, "Intervention effectuée sur les relations ", { siret_responsable });

    const count = await CandidatureRelation.countDocuments({ siret_responsable });

    if (!count) {
      return res.status(404).json({ message: `Aucune relation ne correspond aux sirets : ${siret_responsable}` });
    }

    const candidatureRelations = await CandidatureRelation.find({ siret_responsable });

    res.json(candidatureRelations);
  });

  /**
   * PUT /candidature/relations - Mark all relations for a responsable siret as having an intervention since last session
   */
  router.put("/candidature/relations", async (req, res) => {
    const user = req.user;

    const isAuthorized = hasAccessTo(user, "page_other/api_candidature_relation_update");

    if (!isAuthorized) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à accéder à cette ressource." });
    }

    const { siret_responsable } = await Joi.object({
      siret_responsable: Joi.string().regex(siretFormat).default(null).required(),
    }).validateAsync(req.query, { abortEarly: false });

    logger.info({ type: "http" }, "Intervention effectuée sur les relations ", { siret_responsable });

    const count = await CandidatureRelation.countDocuments({ siret_responsable });

    if (!count) {
      return res.status(404).json({ message: `Aucune relation ne correspond au siret : ${siret_responsable}` });
    }

    await CandidatureRelation.updateMany(
      { siret_responsable },
      { $set: { intervention_since_last_session: true } },
      { returnDocument: "after" }
    );

    const candidatureRelations = await CandidatureRelation.find({ siret_responsable });

    for (const candidatureRelation of candidatureRelations) {
      await updateRelatedFormations(candidatureRelation, { etablissement_gestionnaire_siret: siret_responsable });
    }

    res.json({ data: candidatureRelations, message: "Candidature relations updated" });
  });

  return router;
};
