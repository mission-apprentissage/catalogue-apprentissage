const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { downloader } = require("./downloader");
const { compare } = require("./comparator");
const { DualControlEtablissement } = require("../../../common/model/index");

const importer = async (options) => {
  try {
    logger.info(" -- Start of importer -- ");

    // STEP 1 : Download etablissements from RCO
    let downloadError;

    if (!options.noDownload) {
      logger.info(" -- Downloading etablissements -- ");
      downloadError = await downloader();
      logger.info(`${await DualControlEtablissement.countDocuments()} etablissements téléchargés`);

      if (downloadError) {
        return;
      }
    }

    // STEP 2 : Compare etablissements
    await compare(new Date(), [
      "siege_social",
      "etablissement_siege_siret",
      "siret",
      "siren",
      "nda",
      "naf_code",
      "naf_libelle",
      "tranche_effectif_salarie",
      "date_creation",
      "date_mise_a_jour",
      "diffusable_commercialement",
      "enseigne",
      "onisep_nom",
      "onisep_url",
      "onisep_code_postal",
      "adresse",
      "numero_voie",
      "nom_voie",
      "complement_adresse",
      "code_postal",
      "num_departement",
      "nom_departement",
      "localite",
      "code_insee_localite",
      "cedex",
      "geo_coordonnees",
      "date_fermeture",
      "ferme",
      "region_implantation_code",
      "region_implantation_nom",
      "commune_implantation_code",
      "commune_implantation_nom",
      "pays_implantation_code",
      "pays_implantation_nom",
      "num_academie",
      "nom_academie",
      "uai",
      "uai_valide",
      "uais_potentiels",
      "info_datagouv_ofs",
      "info_datagouv_ofs_info",
      "info_qualiopi_info",
      "api_entreprise_reference",
      "entreprise_siren",
      "entreprise_procedure_collective",
      "entreprise_enseigne",
      "entreprise_numero_tva_intracommunautaire",
      "entreprise_code_effectif_entreprise",
      "entreprise_forme_juridique_code",
      "entreprise_forme_juridique",
      "entreprise_raison_sociale",
      "entreprise_nom_commercial",
      "entreprise_capital_social",
      "entreprise_date_creation",
      "entreprise_date_radiation",
      "entreprise_naf_code",
      "entreprise_naf_libelle",
      "entreprise_date_fermeture",
      "entreprise_ferme",
      "entreprise_siret_siege_social",
      "entreprise_nom",
      "entreprise_prenom",
      "entreprise_categorie",
      "entreprise_tranche_effectif_salarie",
      "formations_attachees",
      "formations_ids",
      "formations_uais",
      "formations_n3",
      "formations_n4",
      "formations_n5",
      "formations_n6",
      "formations_n7",
      "ds_id_dossier",
      "ds_questions_siren",
      "ds_questions_nom",
      "ds_questions_email",
      "ds_questions_uai",
      "ds_questions_has_agrement_cfa",
      "ds_questions_has_certificaton_2015",
      "ds_questions_has_ask_for_certificaton",
      "ds_questions_ask_for_certificaton_date",
      "ds_questions_declaration_code",
      "ds_questions_has_2020_training",
      "certifie_qualite",
      "published",
      "tags",
      "rco_uai",
      "rco_adresse",
      "rco_code_postal",
      "rco_code_insee_localite",
      "rco_geo_coordonnees",
      "idcc",
      "opco_nom",
      "opco_siren",
    ]);

    logger.info(" -- End of importer -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = importer;

if (process.env.standaloneJobs) {
  runScript(async () => {
    const args = process.argv.slice(2);
    const noDownload = args.includes("--noDownload");
    await importer({ noDownload });
  });
}
