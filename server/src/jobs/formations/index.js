const logger = require("../../common/logger");
const { isSunday } = require("../../common/utils/dateUtils");
const { runScript } = require("../scriptWrapper");

const importer = require("./importer");

const formationsJobs = async () => {
  try {
    logger.info({ type: "job" }, "FORMATIONS JOBS : ⏳");

    // Import RCO
    if (process.env.CATALOGUE_APPRENTISSAGE_RCO_IMPORT_ENABLED) {
      logger.debug("Import RCO enabled, starting...");
      await importer({ forceRecompute: isSunday() });
    } else {
      console.log("Import RCO disabled, skipping...");
    }

    logger.info({ type: "job" }, "FORMATIONS JOBS : ✅");
  } catch (error) {
    logger.error({ type: "job" }, error);
    logger.error({ type: "job" }, "FORMATIONS JOBS : ❌");
  }
};

module.exports = formationsJobs;

if (process.env.standaloneJobs) {
  runScript(async () => {
    await formationsJobs();
  });
}
