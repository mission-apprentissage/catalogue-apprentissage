const logger = require("../../common/logger");
const coverage = require("./coverage/coverage");
const { runScript } = require("../scriptWrapper");

const psCoverage = async () => {
  try {
    logger.info(" -- Start of RCO importer -- ");

    await coverage();

    logger.info(" -- End of RCO importer -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = psCoverage;

if (process.env.standalone) {
  runScript(async () => {
    await psCoverage();
  });
}
