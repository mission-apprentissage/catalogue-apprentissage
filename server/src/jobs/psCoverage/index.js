const logger = require("../../common/logger");
const coverage = require("./coverage");
const coverageEtablissements = require("./coverageEtablissement");
const { runScript } = require("../scriptWrapper");

const psCoverageFormation = async () => {
  try {
    logger.info(" -- Start of coverage job -- ");

    await coverage();

    logger.info(" -- End of coverage job -- ");
  } catch (err) {
    logger.error(err);
  }
};
module.exports = psCoverageFormation;

const psCoverageEtablissement = async (catalogue) => {
  try {
    logger.info(" -- Start of coverage job -- ");

    await coverageEtablissements(catalogue);

    logger.info(" -- End of coverage job -- ");
  } catch (err) {
    logger.error(err);
  }
};
module.exports = psCoverageEtablissement;

if (process.env.standalone) {
  runScript(async ({ catalogue }) => {
    await psCoverageFormation();
    await psCoverageEtablissement(catalogue);
  });
}
