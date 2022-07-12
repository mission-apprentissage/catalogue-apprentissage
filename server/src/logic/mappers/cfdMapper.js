const logger = require("../../common/logger");
const { getCfdInfo } = require("@mission-apprentissage/tco-service-node");
const { DateTime } = require("luxon");

const cfdEntreeMap = {
  32033422: ["32033423", "32033424", "32033425"],
  32022316: ["32022317", "32022318"],
  32032209: ["32032210", "32032211"],
  32033606: ["32033603", "32033604", "32033605"],
  32032612: ["32032613", "32032614"],
  32022310: ["32022311", "32022312"],
};

const getCfdEntree = (cfd) => {
  const entry = Object.entries(cfdEntreeMap).find(([, values]) => values.includes(cfd));
  return entry ? entry[0] : cfd;
};

const cfdMapper = async (cfd = null, options = { onisep: true }) => {
  try {
    if (!cfd) {
      throw new Error("cfdMapper cfd must be provided");
    }

    const cfdInfo = await getCfdInfo(cfd, options);
    if (!cfdInfo) {
      throw new Error(`Unable to retrieve data from cfd ${cfd}`);
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

    const { modalite = { duree: null, annee: null }, mefs10 = [] } = mefs;

    const {
      url: onisep_url = null,
      libelle_formation_principal: onisep_intitule = null,
      libelle_poursuite: onisep_libelle_poursuite = null,
      lien_site_onisepfr: onisep_lien_site_onisepfr = null,
      discipline: onisep_discipline = null,
      domaine_sousdomaine: onisep_domaine_sousdomaine = null,
    } = onisep;

    const cfd_entree = getCfdEntree(result.cfd);

    return {
      result: {
        cfd: result.cfd,
        cfd_specialite: result.specialite,
        cfd_outdated: result.cfd_outdated,
        cfd_date_fermeture: result?.date_fermeture && new Date(result.date_fermeture),
        cfd_entree,
        niveau: result.niveau,
        intitule_long: result.intitule_long,
        intitule_court: result.intitule_court,
        diplome: result.diplome,

        bcn_mefs_10: mefs10,

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

module.exports = { cfdMapper, getCfdEntree };
