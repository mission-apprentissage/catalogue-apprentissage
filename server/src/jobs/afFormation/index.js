const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const coverageFormation = require("./afcoverage");
const { AfFormation } = require("../../common/model");
const coverageEtablissement = require("./afcoverageEtablissement");

if (process.env.standalone) {
  runScript(async () => {
    logger.info(`Start affelnet coverage`);

    const formations = await AfFormation.find({
      matching_mna_formation: { $eq: [] },
      code_cfd: { $ne: null },
    }).countDocuments();

    if (formations > 0) {
      await coverageFormation();
    }
    await coverageEtablissement();

    logger.info(`End affelnet coverage`);
  });
}
