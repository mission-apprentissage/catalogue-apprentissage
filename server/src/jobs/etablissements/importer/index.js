const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { downloader } = require("./downloader");
const { converter } = require("./converter");
const { DualControlEtablissement } = require("../../../common/models/index");

const importer = async (options) => {
  try {
    logger.info({ type: "job" }, " -- ETABLISSEMENTS IMPORTER : ⏳ -- ");

    // STEP 1 : Download etablissements from RCO
    let downloadError;

    if (!options?.noDownload) {
      logger.info({ type: "job" }, " -- Downloading etablissements -- ");
      downloadError = await downloader();

      if (downloadError) {
        throw new Error(downloadError);
      }
    }

    if (!(await DualControlEtablissement.countDocuments())) {
      throw new Error("Aucune établissement à convertir.");
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

module.exports = { importer };

if (process.env.standalone) {
  runScript(async () => {
    const args = process.argv.slice(2);
    const noDownload = args.includes("--noDownload");
    await importer({ noDownload });
  });
}
