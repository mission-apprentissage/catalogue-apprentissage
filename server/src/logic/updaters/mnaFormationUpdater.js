const logger = require("../../common/logger");
const Joi = require("joi");
const { cfdMapper } = require("../mappers/cfdMapper");
const { codePostalMapper } = require("../mappers/codePostalMapper");
const { etablissementsMapper } = require("../mappers/etablissementsMapper");
const { diffFormation } = require("../common/utils/diffUtils");

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

const mnaFormationUpdater = async (formation) => {
  try {
    await formationSchema.validateAsync(formation, { abortEarly: false });

    const { result: cfdMapping, messages: cfdMessages } = await cfdMapper(formation.cfd);

    let error = parseErrors(cfdMessages);
    if (error) {
      return { updates: null, formation, error };
    }

    const { result: cpMapping, messages: cpMessages } = await codePostalMapper(formation.code_postal);
    error = parseErrors(cpMessages);
    if (error) {
      return { updates: null, formation, error };
    }

    const cachedCpResult = { [formation.code_postal]: { result: cpMapping, messages: cpMessages } };
    const { result: etablissementsMapping, messages: etablissementsMessages } = await etablissementsMapper(
      formation.etablissement_gestionnaire_siret,
      formation.etablissement_formateur_siret,
      cachedCpResult
    );

    error = parseErrors(etablissementsMessages);
    if (error) {
      return { updates: null, formation, error };
    }

    const published = etablissementsMapping
      ? etablissementsMapping.etablissement_reference_published
      : formation.published;

    const updatedFormation = {
      ...formation,
      ...cfdMapping,
      ...cpMapping,
      ...etablissementsMapping,
      published,
      update_error: null,
    };

    const { updates, keys } = diffFormation(formation, updatedFormation);
    if (updates) {
      updatedFormation.updates_history = buildUpdatesHistory(formation, updates, keys);
      return { updates, formation: updatedFormation };
    }

    return { updates: null, formation };
  } catch (e) {
    logger.error(e);
    return { updates: null, formation, error: e.toString() };
  }
};

module.exports.mnaFormationUpdater = mnaFormationUpdater;
