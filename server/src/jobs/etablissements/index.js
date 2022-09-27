const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const importer = require("./importer");

const etablissementsJobs = async () => {
  try {
    logger.info(`Start Etablissements jobs`);

    // Import RCO
    if (process.env.CATALOGUE_APPRENTISSAGE_RCO_IMPORT_ENABLED) {
      console.log("Import RCO enabled, starting...");
      await importer();
    } else {
      console.log("Import RCO disabled, skipping...");
    }

    logger.info(`End Etablissements jobs`);
  } catch (error) {
    logger.error(error);
  }
};

module.exports = etablissementsJobs;

if (process.env.standaloneJobs) {
  runScript(async () => {
    await etablissementsJobs();
  });
}
