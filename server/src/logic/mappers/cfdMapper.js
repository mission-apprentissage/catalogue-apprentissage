const logger = require("../../common/logger");
const { infosCodes, computeCodes } = require("../../constants/opco");
// const { getCfdInfo } = require("../../common/services/tables_correspondance");
const { mongoose } = require("../../common/mongodb");
const { initTcoModel, getCfdInfo } = require("@mission-apprentissage/tco-service-node");

const cfdMapper = async (cfd = null) => {
  try {
    if (!cfd) {
      throw new Error("cfdMapper cfd must be provided");
    }

    await initTcoModel(mongoose);
    const cfdInfo = await getCfdInfo(cfd);
    if (!cfdInfo) {
      return {
        result: null,
        // serviceAvailable,
        messages: {
          error: `Unable to retrieve data from cfd ${cfd}`,
        },
      };
    }

    const { result, messages } = cfdInfo;
    const { rncp = {}, mefs = {}, onisep = {}, opcos = [] } = result;

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
      partenaires = [],
      blocs_competences = null,
      voix_acces = null,
      code_rncp = null,
      intitule_diplome = null,
      eligible_apprentissage = false,
    } = rncp;

    const rome_codes = (romes || []).map(({ rome }) => rome);

    const { mef10 = null, modalite = { duree: null, annee: null }, mefs10 = [] } = mefs;

    const { url: onisep_url = null } = onisep;

    let opcoNames = null;
    let info_opcos = infosCodes.NotFound;
    let info_opcos_intitule = computeCodes[infosCodes.NotFound];
    if (opcos?.length > 0) {
      opcoNames = opcos.map(({ operateur_de_competences }) => operateur_de_competences);
      info_opcos = infosCodes.Found;
      info_opcos_intitule = computeCodes[infosCodes.Found];
    }

    return {
      result: {
        cfd: result.cfd,
        cfd_specialite: result.specialite,
        cfd_outdated: result.cfd_outdated,
        niveau: result.niveau,
        intitule_long: result.intitule_long,
        intitule_court: result.intitule_court,
        diplome: result.diplome,

        mef_10_code: mef10,
        bcn_mefs_10: mefs10,

        duree: modalite.duree,
        annee: modalite.annee,
        onisep_url,

        rncp_code: code_rncp,
        rncp_intitule: intitule_diplome,
        rncp_eligible_apprentissage: eligible_apprentissage,
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
          partenaires,
          romes,
          blocs_competences,
          voix_acces,
        },
        opcos: opcoNames,
        info_opcos,
        info_opcos_intitule,

        libelle_court: result.libelle_court,
        niveau_formation_diplome: result.niveau_formation_diplome,
      },
      // serviceAvailable,
      messages,
    };
  } catch (e) {
    logger.error(e);
    return {
      result: null,
      // serviceAvailable: true,
      messages: {
        error: e.toString(),
      },
    };
  }
};

module.exports.cfdMapper = cfdMapper;
