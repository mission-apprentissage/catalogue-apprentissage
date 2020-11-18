const logger = require("../../common/logger");
const { getCfdInfo } = require("../common/apiTablesCorrespondances");

const cfdMapper = async (cfd = null) => {
  try {
    if (!cfd) {
      throw new Error("cfdMapper cfd must be provided");
    }

    const cfdInfo = await getCfdInfo(cfd);
    if (!cfdInfo) {
      return {
        result: null,
        messages: null,
      };
    }

    const { result, messages } = cfdInfo;
    const { rncp = {}, mefs = {} } = result;

    // TODO check result obj
    // TODO check if cfd valid
    // TODO check if rncp valid
    // TODO Handle MEF

    const {
      date_fin_validite_enregistrement = null,
      active_inactive = null,
      etat_fiche_rncp = null,
      niveau_europe = null,
      code_type_certif = null,
      type_certif = null,
      ancienne_fiche = null,
      nouvelle_fiche = null,
      demande = null,
      certificateurs = null,
      nsf_code = null,
      nsf_libelle = null,
      romes = [],
      blocs_competences = null,
      voix_acces = null,
      code_rncp = null,
      intitule_diplome = null,
    } = rncp;

    const rome_codes = romes.map(({ rome }) => rome);

    const { mef10 = null, modalite = { duree: null, annee: null } } = mefs;

    return {
      result: {
        cfd: result.cfd,
        cfd_specialite: result.specialite,
        niveau: result.niveau,
        intitule_long: result.intitule_long,
        intitule_court: result.intitule_court,
        diplome: result.diplome,

        mef_10_code: mef10, // TODO fix tables de correspondances
        duree: modalite.duree,
        annee: modalite.annee,
        // onisep_url // TODO tables de correspondances

        rncp_code: code_rncp,
        rncp_intitule: intitule_diplome,
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
