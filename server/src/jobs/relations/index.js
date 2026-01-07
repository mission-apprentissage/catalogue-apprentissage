const logger = require("../../common/logger");
const { isSunday } = require("../../common/utils/dateUtils");
const { runScript } = require("../scriptWrapper");
const { run } = require("./importer");

const relationsJobs = async () => {
  try {
    logger.info({ type: "job" }, "RELATIONS JOBS : ⏳");

    await run();

    logger.info({ type: "job" }, "RELATIONS JOBS : ✅");
  } catch (error) {
    logger.error({ type: "job" }, error);
    logger.error({ type: "job" }, "RELATIONS JOBS : ❌");
  }
};

module.exports = { relationsJobs };

if (process.env.standaloneJobs) {
  runScript(async () => {
    await relationsJobs();
  });
}
