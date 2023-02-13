const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { downloader } = require("./downloader");
const { converter } = require("./converter");
const { DualControlEtablissement } = require("../../../common/model/index");

const importer = async (options) => {
  try {
    logger.info(" -- Start of importer -- ");

    // STEP 1 : Download etablissements from RCO
    let downloadError;

    if (!options?.noDownload) {
      logger.info(" -- Downloading etablissements -- ");
      downloadError = await downloader();

      if (downloadError) {
        logger.error(downloadError);
        return;
      } else {
        logger.info(`${await DualControlEtablissement.countDocuments()} établissements téléchargés`);
      }
    }

    if (!(await DualControlEtablissement.countDocuments())) {
      return;
    }

    // STEP 2 : Convert etablissements
    logger.info(" -- Converting etablissements -- ");
    await converter();

    logger.info(" -- End of importer -- ");
  } catch (err) {
    logger.error(err);
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
