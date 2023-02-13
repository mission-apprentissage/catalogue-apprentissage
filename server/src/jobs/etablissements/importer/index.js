const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { downloader } = require("./downloader");
const { converter } = require("./converter");
const { DualControlEtablissement } = require("../../../common/model/index");

const importer = async (options) => {
  try {
    logger.info({ type: "job" }, " -- Start of importer -- ");

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
      return;
    }

    // STEP 2 : Convert etablissements
    logger.info({ type: "job" }, " -- Converting etablissements -- ");
    await converter();

    logger.info({ type: "job" }, " -- End of importer -- ");
  } catch (error) {
    logger.error({ type: "job" }, error);
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
