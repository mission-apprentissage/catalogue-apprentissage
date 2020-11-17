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
    // TODO Handle MEF
    // TODO handle message

    const rome_codes = result.rncp.romes.map((r) => r.rome);

    const {
      date_fin_validite_enregistrement,
      active_inactive,
      etat_fiche_rncp,
      niveau_europe,
      code_type_certif,
      type_certif,
      ancienne_fiche,
      nouvelle_fiche,
      demande,
      certificateurs,
      nsf_code,
      nsf_libelle,
      romes,
      blocs_competences,
      voix_acces,
    } = result.rncp;

    return {
      cfd: result.cfd,
      cfd_specialite: result.specialite,
      niveau: result.niveau,
      intitule_long: result.intitule_long,
      intitule_court: result.intitule_court,
      diplome: result.diplome,

      mef_10_code: result.mefs.mef10 || null, // TODO fix tables de correspondances

      rncp_code: result.rncp.code_rncp,
      rncp_intitule: result.rncp.intitule_diplome,
      // rncp_eligible_apprentissage // TODO
      rome_codes,
      rncp_details: {
        date_fin_validite_enregistrement,
        active_inactive,
        etat_fiche_rncp,
        niveau_europe,
        code_type_certif,
        type_certif,
        ancienne_fiche,
        nouvelle_fiche,
        demande,
        certificateurs,
        nsf_code,
        nsf_libelle,
        romes,
        blocs_competences,
        voix_acces,
      },
    };
  } catch (error) {
    logger.error(error);
    return formation;
  }
};

module.exports.updateFormationFromCfd = updateFormationFromCfd;
