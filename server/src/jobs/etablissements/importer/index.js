const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { downloader } = require("./downloader");
const { converter } = require("./converter");
const { DualControlEtablissement } = require("../../../common/model/index");

const importer = async (options) => {
  try {
    logger.info({ type: "job" }, " -- ETABLISSEMENTS IMPORTER : ⏳ -- ");

    // STEP 1 : Download etablissements from RCO
    let downloadError;

    if (!options?.noDownload) {
      logger.info({ type: "job" }, " -- Downloading etablissements -- ");
      downloadError = await downloader();

      if (downloadError) {
        logger.error({ type: "job" }, downloadError);
        return;
      } else {
        logger.info({ type: "job" }, `${await DualControlEtablissement.countDocuments()} établissements téléchargés`);
      }
    }

    if (!(await DualControlEtablissement.countDocuments())) {
      logger.warn({ type: "job" }, "Aucune établissement à convertir.");
      return;
    }

    // STEP 2 : Convert etablissements
    logger.info({ type: "job" }, " -- Converting etablissements -- ");
    await converter();

    logger.info({ type: "job" }, " -- ETABLISSEMENTS IMPORTER : ✅ -- ");
  } catch (error) {
    logger.error({ type: "job" }, error);
    logger.error({ type: "job" }, " -- ETABLISSEMENTS IMPORTER : ❌ -- ");
  }
};

module.exports = importer;

if (process.env.standalone) {
  runScript(async () => {
    const args = process.argv.slice(2);
    const noDownload = args.includes("--noDownload");
    await importer({ noDownload });
  });
}
