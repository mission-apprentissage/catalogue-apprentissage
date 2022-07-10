const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { importer } = require("./importer");
const { compare } = require("./comparator");

/**
 *  @type Array<string> // {Array<keyof Formation>}}
 */
const FIELDS_TO_COMPARE = [
  // Here list all the fields we want to compare
  "annee",
  "bcn_mefs_10",
  "capacite",
  "catalogue_published",
  "cfd_date_fermeture",
  "cfd_outdated",
  "cfd_specialite",
  "cfd",
  "code_commune_insee",
  "code_postal",
  "diplome",
  "distance",
  "duree",
  "etablissement_formateur_adresse",
  "etablissement_formateur_code_commune_insee",
  "etablissement_formateur_code_postal",
  "etablissement_formateur_nom_academie",
  "etablissement_formateur_nom_departement",
  "etablissement_formateur_num_academie",
  "etablissement_formateur_num_departement",
  "etablissement_formateur_region",
  "etablissement_formateur_siren",
  "etablissement_formateur_siret",
  "etablissement_formateur_uai",
  "etablissement_gestionnaire_code_commune_insee",
  "etablissement_gestionnaire_code_postal",
  "etablissement_gestionnaire_nom_academie",
  "etablissement_gestionnaire_nom_departement",
  "etablissement_gestionnaire_num_academie",
  "etablissement_gestionnaire_num_departement",
  "etablissement_gestionnaire_region",
  "etablissement_gestionnaire_siren",
  "etablissement_gestionnaire_siret",
  "etablissement_gestionnaire_uai",
  "geo_coordonnees_etablissement_formateur",
  "id_action",
  "id_certifinfo",
  "id_formation",
  "id_rco_formation",
  "intitule_court",
  "intitule_long",
  "intitule_rco",
  "lieu_formation_adresse_computed",
  "lieu_formation_adresse",
  "lieu_formation_geo_coordonnees_computed",
  "lieu_formation_geo_coordonnees",
  "lieu_formation_siret",
  "niveau",
  "onisep_discipline",
  "onisep_domaine_sousdomaine",
  "onisep_intitule",
  "onisep_libelle_poursuite",
  "onisep_lien_site_onisepfr",
  "onisep_url",
  "periode",
  "rncp_code",
  "rncp_eligible_apprentissage",
  "rncp_intitule",
  "rncp_details",

  "rome_codes",

  // // New fields
  "published",
  "etablissement_formateur_cedex",
  "etablissement_formateur_certifie_qualite",
  "etablissement_formateur_complement_adresse",
  "etablissement_formateur_date_creation",
  "etablissement_formateur_enseigne",
  "etablissement_formateur_entreprise_raison_sociale",
  "etablissement_formateur_habilite_rncp",
  "etablissement_formateur_localite",
  "etablissement_gestionnaire_certifie_qualite",
  "etablissement_gestionnaire_date_creation",
  "etablissement_gestionnaire_enseigne",
  "etablissement_gestionnaire_entreprise_raison_sociale",
  "etablissement_gestionnaire_habilite_rncp",
  "etablissement_gestionnaire_localite",
  "etablissement_gestionnaire_siren",
  "etablissement_reference_certifie_qualite",
  "etablissement_reference_habilite_rncp",
  "etablissement_reference_published",
  "etablissement_reference",
  "geo_coordonnees_etablissement_gestionnaire",
  "ids_action",
  "libelle_court",
  "localite",
  "niveau_entree_obligatoire",
  "niveau_formation_diplome",
  "nom_academie",
  "nom_departement",
  "nom",
  "num_academie",
  "num_departement",
  "region",
  "tags",
];

const RNCP_FIELDS_TO_COMPARE = [
  "rncp_details.date_fin_validite_enregistrement",
  "rncp_details.active_inactive",
  "rncp_details.etat_fiche_rncp",
  "rncp_details.niveau_europe",
  "rncp_details.code_type_certif",
  "rncp_details.type_certif",
  "rncp_details.ancienne_fiche",
  "rncp_details.nouvelle_fiche",
  "rncp_details.demande",
  "rncp_details.certificateurs",
  "rncp_details.nsf_code",
  "rncp_details.nsf_libelle",
  "rncp_details.partenaires",
  "rncp_details.romes",
  "rncp_details.blocs_competences",
  "rncp_details.voix_acces",
  "rncp_details.rncp_outdated",
];

const dualControl = async () => {
  try {
    logger.info(" -- Start of dual control -- ");

    const importError = await importer();

    if (!importError) {
      const results = await compare(Date.now(), FIELDS_TO_COMPARE);

      logger.info("results of dual control : ", results);
      console.log("results of dual control : ", results);

      const resultsRncp = await compare(Date.now(), RNCP_FIELDS_TO_COMPARE, "rncp");

      logger.info("results of dual control for rncp fields : ", resultsRncp);
      console.log("results of dual control for rncp fields : ", resultsRncp);
    }

    logger.info(" -- End of dual control -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = dualControl;

if (process.env.standaloneJobs) {
  runScript(async () => {
    await dualControl();
  });
}
