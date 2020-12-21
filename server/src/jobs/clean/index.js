const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const cleanReports = require("./cleanReports");
const cleanLogs = require("./cleanLogs");

const clean = async () => {
  try {
    logger.info(" -- Start clean -- ");

    await cleanReports();
    await cleanLogs();

    logger.info(" -- End of clean -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = clean;

if (process.env.standalone) {
  runScript(async () => {
    await clean();
  });
}
