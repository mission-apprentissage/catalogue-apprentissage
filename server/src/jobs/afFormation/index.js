const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const coverageFormation = require("./afcoverage");
const coverageEtablissement = require("./afcoverageEtablissement");

const afCoverage = async () => {
  try {
    logger.info(`Start affelnet coverage`);

    await coverageFormation();

    await coverageEtablissement();

    logger.info(`End affelnet coverage`);
  } catch (error) {
    logger.error(error);
  }
};

module.exports = afCoverage;

if (process.env.standalone) {
  runScript(async () => {
    await afCoverage();
  });
}
