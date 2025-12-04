const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const { downloadBcnTables } = require("./downloader");
const { importBcnTables } = require("./importer");

const bcnJobs = async () => {
  try {
    logger.info({ type: "job" }, "BCN JOBS : ⏳");

    await downloadBcnTables();
    await importBcnTables();

    logger.info({ type: "job" }, "BCN JOBS : ✅");
  } catch (error) {
    logger.error({ type: "job" }, error);
    logger.error({ type: "job" }, "BCN JOBS : ❌");
  }
};

module.exports = { bcnJobs };

if (process.env.standaloneJobs) {
  runScript(async () => {
    await bcnJobs();
  });
}
