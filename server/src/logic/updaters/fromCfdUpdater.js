const Joi = require("joi");
const logger = require("../../common/logger");
const { getCfdInfo } = require("../common/apiTablesCorrespondances");

const formationSchema = Joi.object({
  cfd: Joi.string().required(),
}).unknown();

const updateFormationFromCfd = async (formation) => {
  try {
    await formationSchema.validateAsync(formation, { abortEarly: false });

    const { result, messages } = await getCfdInfo(formation.cfd);

    console.log(result, messages);

    // TODO check result obj
    // TODO check if cfd valid
    // TODO check if rncp valid
    // TODO Handle ROMES
    // TODO handle message

    return {
      cfd: result.cfd,
      specialite: result.specialite,
      niveau: result.niveau,
      intitule_long: result.intitule_long,
      intitule_court: result.intitule_court,
      diplome: result.diplome,

      rncp_code: result.rncp.code_rncp,
      rncp_intitule: result.rncp.intitule_diplome,
      // rncp_eligible_apprentissage
      rome_codes: result.rncp.romes,
    };
  } catch (error) {
    logger.error(error);
    return formation;
  }
};

module.exports.updateFormationFromCfd = updateFormationFromCfd;
