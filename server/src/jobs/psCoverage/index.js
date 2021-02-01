const coverageEtablissements = require("./pscoverageEtablissement");
const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");
const coverage = require("./pscoverage");
const { Etablissement } = require("../../common/model");

const psCoverageFormation = async () => {
  try {
    logger.info(" -- Start formation coverage job -- ");

    await coverage();

    logger.info(" -- End formation coverage job -- ");
  } catch (err) {
    logger.error(err);
  }
};
module.exports = psCoverageFormation;

const psCoverageEtablissement = async (catalogue) => {
  try {
    logger.info(" -- Start establishments coverage job -- ");

    await coverageEtablissements(catalogue);

    logger.info(" -- End establishments coverage job -- ");
  } catch (err) {
    logger.error(err);
  }
};
module.exports = psCoverageEtablissement;

if (process.env.standalone) {
  runScript(async ({ catalogue }) => {
    let check = await Etablissement.find({}).countDocuments();

    await psCoverageFormation();

    if (check === 0) {
      logger.error("No establishment found, please import collection first");

      return;
    }

    await psCoverageEtablissement(catalogue);
  });
}
