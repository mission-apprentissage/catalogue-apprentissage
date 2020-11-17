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
  // Add cp ?
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

const mnaFormationUpdater = async (formation) => {
  try {
    await formationSchema.validateAsync(formation, { abortEarly: false });

    const { result: cfdMapping, messages: cfdMessages } = await cfdMapper(formation.cfd);

    const { result: cpMapping, messages: cpMessages } = await codePostalMapper(formation.code_postal);

    // TODO handle cfdMessages, cpMessages

    const etablissementsMapping = await etablissementsMapper(
      formation.etablissement_gestionnaire_siret,
      formation.etablissement_formateur_siret
    );

    let published = etablissementsMapping.etablissement_reference_published;

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
      return { isUpdated: true, formation: updatedFormation };
    }

    return { isUpdated: false, formation };
  } catch (error) {
    logger.error(error);
    return { isUpdated: false, formation };
  }
};

module.exports.mnaFormationUpdater = mnaFormationUpdater;
