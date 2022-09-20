const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { importer } = require("./importer");
const { compare } = require("./comparator");
const { afPerimetre } = require("../../affelnet/perimetreDualControl");
const { psPerimetre } = require("../../parcoursup/perimetreDualControl");
const { DualControlFormation } = require("../../../common/model/index");

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
  "etablissement_formateur_cedex",
  "etablissement_formateur_certifie_qualite",
  "etablissement_formateur_code_commune_insee",
  "etablissement_formateur_code_postal",
  "etablissement_formateur_complement_adresse",
  "etablissement_formateur_date_creation",
  "etablissement_formateur_enseigne",
  "etablissement_formateur_entreprise_raison_sociale",
  "etablissement_formateur_habilite_rncp",
  "etablissement_formateur_localite",
  "etablissement_formateur_nom_academie",
  "etablissement_formateur_nom_departement",
  "etablissement_formateur_num_academie",
  "etablissement_formateur_num_departement",
  "etablissement_formateur_region",
  "etablissement_formateur_siren",
  "etablissement_formateur_siret",
  "etablissement_formateur_uai",
  "etablissement_gestionnaire_certifie_qualite",
  "etablissement_gestionnaire_code_commune_insee",
  "etablissement_gestionnaire_code_postal",
  "etablissement_gestionnaire_date_creation",
  "etablissement_gestionnaire_enseigne",
  "etablissement_gestionnaire_entreprise_raison_sociale",
  "etablissement_gestionnaire_habilite_rncp",
  "etablissement_gestionnaire_localite",
  "etablissement_gestionnaire_nom_academie",
  "etablissement_gestionnaire_nom_departement",
  "etablissement_gestionnaire_num_academie",
  "etablissement_gestionnaire_num_departement",
  "etablissement_gestionnaire_region",
  "etablissement_gestionnaire_siren",
  "etablissement_gestionnaire_siret",
  "etablissement_gestionnaire_uai",
  "etablissement_reference_certifie_qualite",
  "etablissement_reference_habilite_rncp",
  "etablissement_reference_published",
  "etablissement_reference",
  "geo_coordonnees_etablissement_formateur",
  "geo_coordonnees_etablissement_gestionnaire",
  "id_action",
  "id_certifinfo",
  "id_formation",
  "id_rco_formation",
  "ids_action",
  "intitule_court",
  "intitule_long",
  "intitule_rco",
  "libelle_court",
  "lieu_formation_adresse_computed",
  "lieu_formation_adresse",
  "lieu_formation_geo_coordonnees_computed",
  "lieu_formation_geo_coordonnees",
  "lieu_formation_siret",
  "localite",
  "niveau_entree_obligatoire",
  "niveau_formation_diplome",
  "niveau",
  "nom_academie",
  "nom_departement",
  "nom",
  "num_academie",
  "num_departement",
  "onisep_discipline",
  "onisep_domaine_sousdomaine",
  "onisep_intitule",
  "onisep_libelle_poursuite",
  "onisep_lien_site_onisepfr",
  "onisep_url",
  "periode",
  "published",
  "region",
  "rncp_code",
  "rncp_details",
  "rncp_eligible_apprentissage",
  "rncp_intitule",
  "rome_codes",
  "tags",

  // NEW FIELDS
  "email",
  "etablissement_formateur_courriel",
  "etablissement_gestionnaire_courriel",
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

const dualControl = async (options) => {
  try {
    logger.info(" -- Start of dual control -- ");

    let importError;

    if (!options.noImport) {
      logger.info(" -- Importing dual control formations -- ");
      importError = await importer();
      logger.info(`${await DualControlFormation.countDocuments()} formations importées`);

      if (importError) {
        return;
      }
    }

    logger.info(" -- Comparing fields -- ");
    const results = await compare(Date.now(), FIELDS_TO_COMPARE);
    logger.info("results of dual control : ", results);

    logger.info(" -- Comparing rncp fields -- ");
    const resultsRncp = await compare(Date.now(), RNCP_FIELDS_TO_COMPARE, "rncp");
    logger.info("results of dual control for rncp fields : ", resultsRncp);

    logger.info(" -- Checking perimeters -- ");
    await afPerimetre();
    await psPerimetre();

    logger.info(" -- End of dual control -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = dualControl;

if (process.env.standaloneJobs) {
  runScript(async () => {
    const args = process.argv.slice(2);
    const noImport = args.includes("--noImport");
    await dualControl({ noImport });
  });
}
