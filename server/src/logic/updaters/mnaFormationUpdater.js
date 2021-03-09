const logger = require("../../common/logger");
const Joi = require("joi");
const { findRcoFormationFromConvertedId, getPeriodeTags } = require("../../jobs/common/utils/rcoUtils");
const { cfdMapper } = require("../mappers/cfdMapper");
const { codePostalMapper } = require("../mappers/codePostalMapper");
const { etablissementsMapper } = require("../mappers/etablissementsMapper");
const { diffFormation } = require("../common/utils/diffUtils");
const { PendingRcoFormation } = require("../../common/model");

const formationSchema = Joi.object({
  cfd: Joi.string().required(),
  etablissement_gestionnaire_siret: Joi.string().required(),
  etablissement_formateur_siret: Joi.string().required(),
  code_postal: Joi.string().required(),
}).unknown();

/*
 * Build updates history
 */
const buildUpdatesHistory = (formation, updates, keys) => {
  const from = keys.reduce((acc, key) => {
    acc[key] = formation[key];
    return acc;
  }, {});
  return [...formation.updates_history, { from, to: { ...updates }, updated_at: Date.now() }];
};

const parseErrors = (messages) => {
  if (!messages) {
    return "";
  }
  return Object.entries(messages)
    .filter(([key, value]) => key === "error" || `${value}`.toLowerCase().includes("erreur"))
    .reduce((acc, [key, value]) => `${acc}${acc ? " " : ""}${key}: ${value}.`, "");
};

const mnaFormationUpdater = async (formation, { withHistoryUpdate = true, withCodePostalUpdate = true } = {}) => {
  try {
    await formationSchema.validateAsync(formation, { abortEarly: false });

    const { result: cfdMapping, messages: cfdMessages } = await cfdMapper(formation.cfd);

    let error = parseErrors(cfdMessages);
    if (error) {
      return { updates: null, formation, error };
    }

    const { result: cpMapping = {}, messages: cpMessages } = withCodePostalUpdate
      ? await codePostalMapper(formation.code_postal)
      : {};
    error = parseErrors(cpMessages);
    if (error) {
      return { updates: null, formation, error };
    }

    const rncpInfo = {
      rncp_code: cfdMapping?.rncp_code,
      rncp_intitule: cfdMapping?.rncp_intitule,
      rncp_eligible_apprentissage: cfdMapping?.rncp_eligible_apprentissage,
      ...cfdMapping?.rncp_details,
    };
    const { result: etablissementsMapping, messages: etablissementsMessages } = await etablissementsMapper(
      formation.etablissement_gestionnaire_siret,
      formation.etablissement_formateur_siret,
      rncpInfo
    );

    error = parseErrors(etablissementsMessages);
    if (error) {
      return { updates: null, formation, error };
    }

    const rcoFormation = await findRcoFormationFromConvertedId(formation.id_rco_formation);
    let published = rcoFormation?.published ?? false; // not found in rco should not be published

    let update_error = null;
    if (etablissementsMapping?.etablissement_reference_published === false) {
      published = false;
      if (rcoFormation?.published) {
        update_error = "Formation not published because of etablissement_reference_published";
      }
    }

    // set tags
    let tags = [];
    try {
      const periode = JSON.parse(formation.periode);
      tags = getPeriodeTags(periode);
    } catch (e) {
      logger.error("unable to set tags", e);
    }

    let uai_formation = formation.uai_formation;
    if (!uai_formation) {
      // no uai ? check if it was set by user
      const pendingFormation = await PendingRcoFormation.findOne(
        { id_rco_formation: formation.id_rco_formation },
        { uai_formation: 1 }
      ).lean();
      if (pendingFormation) {
        uai_formation = pendingFormation.uai_formation;
      }

      // still no uai ? try to fill it with etablissement formateur
      if (!uai_formation) {
        uai_formation = etablissementsMapping?.etablissement_formateur_uai;
      }
    }

    // fill mef 10 with affelnet data if we have it
    formation.mef_10_code = formation.mef_10_code ?? formation.affelnet_mef_10_code;

    const updatedFormation = {
      ...formation,
      ...cfdMapping,
      ...cpMapping,
      ...etablissementsMapping,
      tags,
      published,
      update_error,
      uai_formation,
    };

    const { updates, keys } = diffFormation(formation, updatedFormation);
    if (updates) {
      if (withHistoryUpdate) {
        updatedFormation.updates_history = buildUpdatesHistory(formation, updates, keys);
      }
      return { updates, formation: updatedFormation };
    }

    return { updates: null, formation };
  } catch (e) {
    logger.error(e);
    return { updates: null, formation, error: e.toString() };
  }
};

module.exports.mnaFormationUpdater = mnaFormationUpdater;
