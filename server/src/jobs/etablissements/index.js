const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const importer = require("./importer");

const etablissementsJobs = async () => {
  try {
    logger.info({ type: "job" }, `ETABLISSEMENTS JOBS ⏳`);

    // Import RCO
    if (process.env.CATALOGUE_APPRENTISSAGE_RCO_IMPORT_ENABLED) {
      console.log("Import RCO enabled, starting...");
      await importer();
    } else {
      console.log("Import RCO disabled, skipping...");
    }
    logger.info({ type: "job" }, `ETABLISSEMENTS JOBS ✅`);
  } catch (error) {
    logger.error({ type: "job" }, error);
    logger.error({ type: "job" }, `ETABLISSEMENTS JOBS ❌`);
  }
};

module.exports = etablissementsJobs;

if (process.env.standaloneJobs) {
  runScript(async () => {
    await etablissementsJobs();
  });
}
