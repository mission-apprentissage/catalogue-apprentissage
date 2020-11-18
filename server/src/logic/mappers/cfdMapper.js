const logger = require("../../common/logger");
const { getCfdInfo } = require("../common/apiTablesCorrespondances");

const cfdMapper = async (cfd = null) => {
  try {
    if (!cfd) {
      throw new Error("cfdMapper cfd must be provided");
    }

    const { result, messages } = await getCfdInfo(cfd);

    // TODO check result obj
    // TODO check if cfd valid
    // TODO check if rncp valid
    // TODO Handle MEF
    // TODO handle message

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
      romes = [],
      blocs_competences,
      voix_acces,
    } = result.rncp;

    const rome_codes = romes.map(({ rome }) => rome);

    return {
      result: {
        cfd: result.cfd,
        cfd_specialite: result.specialite,
        niveau: result.niveau,
        intitule_long: result.intitule_long,
        intitule_court: result.intitule_court,
        diplome: result.diplome,

        mef_10_code: result.mefs.mef10 || null, // TODO fix tables de correspondances
        // duree: result.mefs.modalite.duree, // TODO Undefined
        // annee: result.mefs.modalite.annee, // TODO Undefined
        // onisep_url // TODO tables de correspondances

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
      },
      messages,
    };
  } catch (error) {
    logger.error(error);
    return {
      result: null,
      messages: null,
    };
  }
};

module.exports.cfdMapper = cfdMapper;
