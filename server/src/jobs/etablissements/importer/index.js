const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { downloader } = require("./downloader");
const { converter } = require("./converter");
// const { afPerimetre } = require("../../affelnet/perimetreDualControl");
// const { psPerimetre } = require("../../parcoursup/perimetreDualControl");
const { DualControlFormation } = require("../../../common/model/index");

const importer = async (options) => {
  try {
    logger.info(" -- Start of importer -- ");

    // STEP 1 : Download etablissements from RCO
    let downloadError;

    if (!options.noDownload) {
      logger.info(" -- Downloading formations -- ");
      downloadError = await downloader();
      logger.info(`${await DualControlFormation.countDocuments()} formations téléchargées`);

      if (downloadError) {
        return;
      }
    }

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
