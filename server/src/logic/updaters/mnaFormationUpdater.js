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

/**
 * Parse messages to check if there are errors
 */
const parseErrorMessages = ({ cfdMessages, cpMessages }) => {
  const cfdError = parseErrors(cfdMessages);
  const cpError = parseErrors(cpMessages);
  return `${cfdError}${cfdError ? " " : ""}${cpError}`;
};

const mnaFormationUpdater = async (formation) => {
  try {
    await formationSchema.validateAsync(formation, { abortEarly: false });

    const { result: cfdMapping, messages: cfdMessages } = await cfdMapper(formation.cfd);

    const { result: cpMapping, messages: cpMessages } = await codePostalMapper(formation.code_postal);

    const error = parseErrorMessages({
      cfdMessages,
      cpMessages,
    });

    const etablissementsMapping = await etablissementsMapper(
      formation.etablissement_gestionnaire_siret,
      formation.etablissement_formateur_siret
    );

    const published = etablissementsMapping
      ? etablissementsMapping.etablissement_reference_published
      : formation.published;

    const updatedFormation = {
      ...formation,
      ...cfdMapping,
      ...cpMapping,
      ...etablissementsMapping,
      published,
    };

    const { updates, keys } = diffFormation(formation, updatedFormation);
    if (updates) {
      updatedFormation.updates_history = buildUpdatesHistory(formation, updates, keys);
      return { updates, formation: updatedFormation, error };
    }

    return { updates: null, formation, error };
  } catch (e) {
    logger.error(e);
    return { updates: null, formation, error: e.toString() };
  }
};

module.exports.mnaFormationUpdater = mnaFormationUpdater;
