const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { downloader } = require("./downloader");
const { compare } = require("./comparator");
const { converter } = require("./converter");
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

    // Compare etablissements
    await compare(new Date(), [
      "adresse",
      "api_entreprise_reference",
      "cedex",
      "certifie_qualite",
      "code_insee_localite",
      "code_postal",
      "commune_implantation_code",
      "commune_implantation_nom",
      "complement_adresse",
      "date_creation",
      "date_fermeture",
      "diffusable_commercialement",
      "enseigne",
      "entreprise_capital_social",
      "entreprise_categorie",
      "entreprise_code_effectif_entreprise",
      "entreprise_date_creation",
      "entreprise_date_fermeture",
      "entreprise_date_radiation",
      "entreprise_enseigne",
      "entreprise_ferme",
      "entreprise_forme_juridique_code",
      "entreprise_forme_juridique",
      "entreprise_naf_code",
      "entreprise_naf_libelle",
      "entreprise_nom_commercial",
      "entreprise_nom",
      "entreprise_numero_tva_intracommunautaire",
      "entreprise_prenom",
      "entreprise_procedure_collective",
      "entreprise_raison_sociale",
      "entreprise_siren",
      "entreprise_siret_siege_social",
      "entreprise_tranche_effectif_salarie",
      "etablissement_siege_siret",
      "ferme",
      "formations_attachees",
      "formations_n3",
      "formations_n4",
      "formations_n5",
      "formations_n6",
      "formations_n7",
      "formations_uais",
      "geo_coordonnees",
      "idcc",
      "info_datagouv_ofs_info",
      "info_datagouv_ofs",
      "info_qualiopi_info",
      "localite",
      "naf_code",
      "naf_libelle",
      "nda",
      "nom_academie",
      "nom_departement",
      "nom_voie",
      "num_academie",
      "num_departement",
      "numero_voie",
      "onisep_code_postal",
      "onisep_nom",
      "onisep_url",
      "opco_nom",
      "opco_siren",
      "pays_implantation_code",
      "pays_implantation_nom",
      "published",
      "rco_adresse",
      "rco_code_insee_localite",
      "rco_code_postal",
      "rco_geo_coordonnees",
      "rco_uai",
      "region_implantation_code",
      "region_implantation_nom",
      "siege_social",
      "siren",
      "siret",
      "tags",
      "tranche_effectif_salarie",
      "uai_valide",
      "uai",
      "uais_potentiels",
    ]);

    // STEP 2 : Convert etablissements
    await converter();

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
