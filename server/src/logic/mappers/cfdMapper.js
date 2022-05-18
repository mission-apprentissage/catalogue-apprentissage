// @ts-check
const logger = require("../../common/logger");
const { getCfdInfo } = require("@mission-apprentissage/tco-service-node");
const { DateTime } = require("luxon");
const csvToJson = require("convert-csv-to-json");

const FILE_PATH = "/data/uploads/cfd-entree-sortie.csv";

let cfdEntreeSortieMap = null;
/**
 * Compute a map from an uploaded CSV file
 *
 * @param {Array<{cfd: string, cfd_entree: string, cfd_sortie: string}>} [jsonData=null]
 * @returns {{[key: string]: {cfd_entree: string, cfd_sortie: string}}}
 */
const loadCfdEntreeSortieMap = (jsonData = null) => {
  try {
    const lines = jsonData ?? csvToJson.getJsonFromCsv(FILE_PATH);
    cfdEntreeSortieMap = lines.reduce((acc, { cfd, cfd_entree, cfd_sortie }) => {
      acc[cfd.trim()] = { cfd_entree: cfd_entree.trim(), cfd_sortie: cfd_sortie.trim() };
      return acc;
    }, {});
  } catch (e) {
    console.error(e);
    cfdEntreeSortieMap = {};
  }
  return cfdEntreeSortieMap;
};

/**
 * Retrieve cfd entree from cfd (it may be the same value)
 *
 * @param {string} cfd
 * @returns {string}
 */
const getCfdEntree = (cfd) => {
  if (!cfdEntreeSortieMap) {
    loadCfdEntreeSortieMap();
  }
  return cfdEntreeSortieMap[cfd]?.cfd_entree ?? cfd;
};

/**
 * Retrieve cfd sortie from cfd (it may be the same value)
 *
 * @param {string} cfd
 * @returns {string}
 */
const getCfdSortie = (cfd) => {
  if (!cfdEntreeSortieMap) {
    loadCfdEntreeSortieMap();
  }
  return cfdEntreeSortieMap[cfd]?.cfd_sortie ?? cfd;
};

/**
 * Get MEF_STAT_11 list from a CFD
 *
 * @param {string} cfd
 * @param {{[key:string]: string[]}} [mefs11Map={}]
 * @returns {Promise<string[]>}
 */
const getMefs11 = async (cfd, mefs11Map = {}) => {
  if (mefs11Map[cfd]) {
    return mefs11Map[cfd];
  }

  const cfdInfo = await getCfdInfo(cfd, { onisep: false });
  mefs11Map[cfd] = cfdInfo?.result?.mefs?.mefs11 ?? [];
  return mefs11Map[cfd];
};

/**
 * Get cfd data
 *
 * @param {string|null} [cfd=null]
 * @param {{onisep: boolean}} options
 * @returns
 */
const cfdMapper = async (cfd = null, options = { onisep: true }) => {
  try {
    if (!cfd) {
      throw new Error("cfdMapper cfd must be provided");
    }

    const cfdInfo = await getCfdInfo(cfd, options);
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
      partenaires = [],
      blocs_competences = null,
      voix_acces = null,
      code_rncp = null,
      intitule_diplome = null,
      eligible_apprentissage = false,
      rncp_outdated = false,
    } = rncp;

    const rome_codes = (romes || []).map(({ rome }) => rome);

    const { modalite = { duree: null, annee: null }, mefs10 = [], mefs11 = [] } = mefs;

    const {
      url: onisep_url = null,
      libelle_formation_principal: onisep_intitule = null,
      libelle_poursuite: onisep_libelle_poursuite = null,
      lien_site_onisepfr: onisep_lien_site_onisepfr = null,
      discipline: onisep_discipline = null,
      domaine_sousdomaine: onisep_domaine_sousdomaine = null,
    } = onisep;

    const cfd_entree = getCfdEntree(result.cfd);
    const cfd_sortie = getCfdSortie(result.cfd);

    const mefs11Map = {
      [result.cfd]: mefs11,
    };

    const mefs11_entree = await getMefs11(cfd_entree, mefs11Map);
    const mefs11_sortie = await getMefs11(cfd_sortie, mefs11Map);

    return {
      result: {
        cfd: result.cfd,
        cfd_entree,
        cfd_sortie,

        cfd_specialite: result.specialite,
        cfd_outdated: result.cfd_outdated,
        cfd_date_fermeture: result?.date_fermeture && new Date(result.date_fermeture),

        niveau: result.niveau,
        intitule_long: result.intitule_long,
        intitule_court: result.intitule_court,
        diplome: result.diplome,

        bcn_mefs_10: mefs10,
        bcn_mefs_stat_11: mefs11,
        bcn_mefs_stat_11_entree: mefs11_entree,
        bcn_mefs_stat_11_sortie: mefs11_sortie,

        duree: modalite.duree,
        annee: modalite.annee,

        onisep_url,
        onisep_intitule,
        onisep_libelle_poursuite,
        onisep_lien_site_onisepfr,
        onisep_discipline,
        onisep_domaine_sousdomaine,

        rncp_code: code_rncp,
        rncp_intitule: intitule_diplome,
        rncp_eligible_apprentissage: eligible_apprentissage,
        rome_codes,
        rncp_details: {
          date_fin_validite_enregistrement: date_fin_validite_enregistrement
            ? DateTime.fromFormat(date_fin_validite_enregistrement, "dd/MM/yyyy").toJSDate()
            : null,
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
          rncp_outdated,
        },

        libelle_court: result.libelle_court,
        niveau_formation_diplome: result.niveau_formation_diplome,
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

module.exports = { cfdMapper, getCfdEntree, getCfdSortie, loadCfdEntreeSortieMap };
