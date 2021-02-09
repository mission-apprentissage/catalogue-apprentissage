const { runScript } = require("./scriptWrapper");
const logger = require("../common/logger");
const rcoImporter = require("./rcoImporter");
const rcoConverter = require("./rcoConverter");
const trainingsUpdater = require("./trainingsUpdater");
const psReference = require("./psReference");
const afReference = require("./afReference");
// const afCoverage = require("./afFormation/index");
// const afReconciliation = require("./afFormation/reconciliation");

const clean = require("./clean");
const { importEtablissements } = require("./etablissements");

runScript(async ({ catalogue }) => {
  try {
    logger.info(`Start all jobs`);
    await clean();

    await importEtablissements(catalogue);

    // rco
    await rcoImporter();
    await rcoConverter();
    await trainingsUpdater();

    // parcoursup
    await psReference();

    // affelnet
    // await afCoverage(); // TODO @kevbarns uncomment
    // await afReconciliation(); // TODO @kevbarns uncomment
    await afReference();
  } catch (error) {
    logger.error(error);
  }
});
