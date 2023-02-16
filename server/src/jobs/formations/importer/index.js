const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { downloader } = require("./downloader");
const { converter } = require("./converter");
const { DualControlFormation } = require("../../../common/model/index");
const { updateRelationFields: updateEtablissementRelationFields } = require("../../etablissements/importer/converter");
const { updateRelationFields: updateFormationRelationFields } = require("./converter");

const importer = async (
  { noDownload = false, forceRecompute = false, skip = 0 } = { noDownload: false, forceRecompute: false, skip: 0 }
) => {
  try {
    logger.info({ type: "job" }, " -- Start of importer -- ");

    // STEP 1 : Download formations from RCO
    let downloadError;

    if (!noDownload) {
      logger.info({ type: "job" }, " -- Downloading formations -- ");
      downloadError = await downloader();

      if (downloadError) {
        logger.error({ type: "job" }, downloadError);
        return;
      } else {
        logger.info({ type: "job" }, `${await DualControlFormation.countDocuments()} formations téléchargées`);
      }
    }

    if (!(await DualControlFormation.countDocuments())) {
      return;
    }

    // STEP 2 : Convert formations
    logger.info({ type: "job" }, " -- Converting formations -- ");
    await converter({ forceRecompute, skip });

    // STEP 3 : Rebuild relations between etablissements and formations
    await updateEtablissementRelationFields();
    await updateFormationRelationFields();

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
    const forceRecompute = args.includes("--forceRecompute");
    const skip = +(args.find((arg) => arg.startsWith("--skip"))?.split("=")?.[1] ?? 0);
    await importer({ noDownload, forceRecompute, skip });
  });
}
