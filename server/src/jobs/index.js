const { runScript } = require("./scriptWrapper");
const logger = require("../common/logger");
const rcoImporter = require("./rcoImporter");
const rcoConverter = require("./rcoConverter");
const trainingsUpdater = require("./trainingsUpdater");
const psReference = require("./reference/parcoursup");
const afReference = require("./reference/affelnet");
const psPertinence = require("./pertinence/parcoursup");
const afPertinence = require("./pertinence/affelnet");
const afCoverage = require("./affelnet/coverage");
const afReconciliation = require("./affelnet/reconciliation");

const clean = require("./clean");
const { rebuildEsIndex } = require("./esIndex/esIndex");
const { importEtablissements } = require("./etablissements");

runScript(async ({ catalogue }) => {
  try {
    logger.info(`Start all jobs`);
    await clean();

    await importEtablissements(catalogue);

    // rco
    await rcoImporter();
    await rcoConverter();
    await trainingsUpdater(); // ~ 59 minutes

    // parcoursup
    await psReference(); // ~ 34 minutes
    await psPertinence(); // ~ 8 secondes

    // affelnet
    await afCoverage();
    await afReconciliation();
    await afReference();
    await afPertinence();

    // es
    await rebuildEsIndex("convertedformation"); // ~ 8 secondes
  } catch (error) {
    logger.error(error);
  }
});
