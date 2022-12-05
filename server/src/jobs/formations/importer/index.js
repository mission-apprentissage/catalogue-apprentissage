const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { downloader } = require("./downloader");
const { converter } = require("./converter");
// const { afPerimetre } = require("../../affelnet/perimetreDualControl");
// const { psPerimetre } = require("../../parcoursup/perimetreDualControl");
const { DualControlFormation } = require("../../../common/model/index");
const { updateRelationFields: updateEtablissementRelationFields } = require("../../etablissements/importer/converter");
const { updateRelationFields: updateFormationRelationFields } = require("./converter");

const importer = async (options) => {
  try {
    logger.info(" -- Start of importer -- ");

    // STEP 1 : Download formations from RCO
    let downloadError;

    if (!options?.noDownload) {
      logger.info(" -- Downloading formations -- ");
      downloadError = await downloader();

      if (downloadError) {
        logger.error(downloadError);
        return;
      } else {
        logger.info(`${await DualControlFormation.countDocuments()} formations téléchargées`);
      }
    }

    if (!(await DualControlFormation.countDocuments())) {
      return;
    }

    // STEP 2 : Convert formations
    await converter();

    // STEP 3 : Rebuild relations between etablissements and formations
    await updateEtablissementRelationFields();
    await updateFormationRelationFields();

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
