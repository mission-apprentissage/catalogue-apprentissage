const logger = require("../../common/logger");
const { Config } = require("../../common/models");
const { runScript } = require("../scriptWrapper");
const { importer } = require("./importer");

const etablissementsJobs = async () => {
  const config = await Config.findOne();

  try {
    logger.info({ type: "job" }, `ETABLISSEMENTS JOBS ⏳`);

    // Import RCO
    if (config?.rco_import) {
      logger.debug("Import RCO enabled, starting...");
      await importer();
    } else {
      logger.debug("Import RCO disabled, skipping...");
    }
    logger.info({ type: "job" }, `ETABLISSEMENTS JOBS ✅`);
  } catch (error) {
    logger.error({ type: "job" }, error);
    logger.error({ type: "job" }, `ETABLISSEMENTS JOBS ❌`);
  }
};

module.exports = { etablissementsJobs };

if (process.env.standaloneJobs) {
  runScript(async () => {
    await etablissementsJobs();
  });
}
