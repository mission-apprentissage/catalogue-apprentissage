const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const coverageFormation = require("./afcoverage");
const coverageEtablissement = require("./afcoverageEtablissement");

if (process.env.standalone) {
  runScript(async ({ catalogue }) => {
    logger.info(`Start affelnet coverage`);

    await coverageFormation();
    await coverageEtablissement(catalogue);

    logger.info(`End affelnet coverage`);
  });
}
