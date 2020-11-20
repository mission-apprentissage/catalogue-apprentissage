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
        messages: {
          error: `Unable to retrieve data from cfd ${cfd}`,
        },
      };
    }

    const { result, messages } = cfdInfo;
    const { rncp = {}, mefs = {}, onisep = {} } = result;

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

    const rome_codes = (romes || []).map(({ rome }) => rome);

    const { mef10 = null, modalite = { duree: null, annee: null } } = mefs;

    const { url: onisep_url = null } = onisep;

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
        onisep_url,

        rncp_code: code_rncp,
        rncp_intitule: intitule_diplome,
        // rncp_eligible_apprentissage // TODO  tables de correspondances
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
  } catch (e) {
    logger.error(e);
    return {
      result: null,
      messages: {
        error: e.toString(),
      },
    };
  }
};

module.exports.cfdMapper = cfdMapper;
