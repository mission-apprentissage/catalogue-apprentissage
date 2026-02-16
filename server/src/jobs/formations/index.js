const logger = require("../../common/logger");
const { Config } = require("../../common/models");
const { isSunday } = require("../../common/utils/dateUtils");
const { runScript } = require("../scriptWrapper");
const { importer } = require("./importer");

const formationsJobs = async () => {
  const config = await Config.findOne();

  try {
    logger.info({ type: "job" }, "FORMATIONS JOBS : ⏳");

    // Import RCO
    if (config?.rco_import) {
      logger.debug("Import RCO enabled, starting...");
      await importer({ forceRecompute: isSunday() });
    } else {
      logger.debug("Import RCO disabled, skipping...");
    }

    logger.info({ type: "job" }, "FORMATIONS JOBS : ✅");
  } catch (error) {
    logger.error({ type: "job" }, error);
    logger.error({ type: "job" }, "FORMATIONS JOBS : ❌");
  }
};

module.exports = { formationsJobs };

if (process.env.standaloneJobs) {
  runScript(async () => {
    await formationsJobs();
  });
}
