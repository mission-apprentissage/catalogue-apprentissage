const logger = require("../../common/logger");
const Joi = require("joi");
const { mnaFormationFromCfdMapper } = require("../mappers/fromCfdMapper");
const { mnaFormationFromCodePostalMapper } = require("../mappers/fromCodePostalMapper");
const { mnaFormationEtablissementsMapper } = require("../mappers/etablissementsMapper");

const formationSchema = Joi.object({
  cfd: Joi.string().required(),
}).unknown();

const mnaFormationUpdater = async (formation) => {
  try {
    await formationSchema.validateAsync(formation, { abortEarly: false });

    const cfdMapping = await mnaFormationFromCfdMapper(formation.cfd); // { result, messages }
    // console.log(cfdMapping);

    const cpMapping = await mnaFormationFromCodePostalMapper(formation.code_postal); // { result, messages }
    //console.log(cpMapping);

    const etablissementsMapping = await mnaFormationEtablissementsMapper(
      formation.etablissement_gestionnaire_siret,
      formation.etablissement_formateur_siret
    ); // { result, messages }
    console.log(etablissementsMapping);

    // 'updates_history':
  } catch (error) {
    logger.error(error);
    return formation;
  }
};

module.exports.mnaFormationUpdater = mnaFormationUpdater;
