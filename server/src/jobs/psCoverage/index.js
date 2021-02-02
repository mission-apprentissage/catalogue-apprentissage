const coverageEtablissements = require("./pscoverageEtablissement");
const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");
const coverageFormation = require("./pscoverage");
const { Etablissement } = require("../../common/model");

if (process.env.standalone) {
  runScript(async () => {
    let check = await Etablissement.find({}).countDocuments();

    await coverageFormation();

    if (check === 0) {
      logger.error("No establishment found, please import collection first");

      return;
    }

    await await coverageEtablissements();
  });
}
