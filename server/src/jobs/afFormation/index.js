const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const coverageFormation = require("./afcoverage");
const coverageEtablissement = require("./afcoverageEtablissement");
const { AfFormation } = require("../../common/model");

if (process.env.standalone) {
  runScript(async ({ catalogue, tableCorrespondance }) => {
    logger.info(`Start affelnet coverage`);

    const formations = await AfFormation.find({ matching_mna_formation: { $eq: [] } }).countDocuments();

    console.log("formations", formations);
    if (formations > 0) {
      await coverageFormation(tableCorrespondance);
    }
    await coverageEtablissement(catalogue);

    logger.info(`End affelnet coverage`);
  });
}
