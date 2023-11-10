const logger = require("../../../common/logger");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { getJsonFromXlsxFile } = require("../../../common/utils/fileUtils");
const { AffelnetFormation } = require("../../../common/model");

const FILE_PATH = "/data/uploads/affelnet-import.xlsx";

const afImportFormations = async () => {
  logger.info({ type: "job" }, " -- AFFELNET | IMPORT : ⏳ -- ");

  try {
    const data = getJsonFromXlsxFile(FILE_PATH);
    let count = 0;

    logger.info({ type: "job" }, `${data.length} formations récupérées du fichier excel, début de l'enregistrement...`);

    await AffelnetFormation.deleteMany({});

    await asyncForEach(data, async (item) => {
      try {
        const code_mef = item["CODE_MEF"]?.trim();
        const code_postal = item["CP"]?.trim();
        const uai = item["UAI"]?.trim();
        const code_voie = item["CODE_VOIE"]?.trim();
        const code_specialite = item["CODE_SPECIALITE"]?.trim();
        const cle_ministere_educatif = item["CLE_MINISTERE_EDUCATIF"]?.trim();
        const academie = item["ACADEMIE"]?.trim();
        const code_offre = item["CODE_OFFRE"]?.trim();

        logger.debug({ type: "job" }, `${academie}/${code_offre}`);

        await AffelnetFormation.create({
          cle_ministere_educatif,
          uai,
          libelle_type_etablissement: item["LIBELLE_TYPE_ETABLISSEMENT"]?.trim(),
          libelle_etablissement: item["LIBELLE_ETABLISSEMENT"]?.trim(),
          adresse: item["ADRESSE"]?.trim(),
          code_postal,
          commune: item["COMMUNE"]?.trim(),
          telephone: item["TELEPHONE"]?.trim(),
          email: item["MEL"]?.trim(),
          academie,
          code_offre,
          ministere: item["MINISTERE"]?.trim(),
          etablissement_type: item["PUBLIC_PRIVE"]?.trim() === "PR" ? "Privée" : "Public",
          type_contrat: item["TYPE_CONTRAT"]?.trim(),
          code_type_etablissement: item["CODE_TYPE_ETABLISSEMENT"]?.trim(),
          code_nature: item["CODE_NATURE"]?.trim(),
          code_district: item["CODE_DISTRICT"]?.trim(),
          code_bassin: item["CODE_BASSIN"]?.trim(),
          cio: item["CIO"]?.trim(),
          internat: item["INTERNAT"] === "O",
          reseau_ambition_reussite: item["RESEAU_AMBITION_REUSSITE"] === "O",
          libelle_mnemonique: item["MNEMONIQUE"]?.trim(),
          code_specialite,
          libelle_ban: item["LIBELLE_BAN"]?.trim(),
          code_mef,
          code_voie,
          type_voie: item["LIBELLE_VOIE"]?.trim(),
          saisie_possible_3eme: item["SAISIE_POSSIBLE_3EME"] === "O",
          saisie_reservee_segpa: item["SAISIE_RESREVEE_SEGPA"] === "O",
          saisie_possible_2nde: item["SAISIE_POSSIBLE_2DE"] === "O",
          visible_tsa: item["VISIBLE_PORTAIL"] === "O",
          libelle_formation: item["LIBELLE_FORMATION"]?.trim(),
          url_onisep_formation: item["URL_ONISEP_FORMATION"]?.trim(),
          libelle_etablissement_tsa: item["LIBELLE_ETABLISSEMENT"]?.trim(),
          url_onisep_etablissement: item["URL_ONISEP_ETABLISSEMENT"]?.trim(),
          ville: item["LIBELLE_VILLE"]?.trim(),
          campus_metier: item["CAMPUS_METIER"] === "O",
          modalites: item["MODALITES_PARTICULIERES"] === "O",
          informations: item["INFORMATIONS"],
          siret_uai_gestionnaire: item["SIRET_UAI_GESTIONNAIRE"],
          integree_catalogue: item["INTEGREE_CATALOGUE"] === "O",
          coordonnees_gps_latitude: item["COORDONNEES_GPS_LATITUDE"]?.trim(),
          coordonnees_gps_longitude: item["COORDONNEES_GPS_LONGITUDE"]?.trim(),
        });

        count++;
      } catch (error) {
        logger.error({ type: "job" }, error);
      }
    });

    logger.info({ type: "job" }, `${count} formations importées !`);
    logger.info({ type: "job" }, " -- AFFELNET | IMPORT : ✅ -- ");
  } catch (error) {
    logger.error({ type: "job" }, " -- AFFELNET | IMPORT : ❌ -- ");
  }
};

module.exports = { afImportFormations };
