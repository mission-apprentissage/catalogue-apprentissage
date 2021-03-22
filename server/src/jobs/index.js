const { runScript } = require("./scriptWrapper");
const logger = require("../common/logger");
const rcoImporter = require("./rcoImporter");
const rcoConverter = require("./rcoConverter");
// const trainingsUpdater = require("./trainingsUpdater");
const psReference = require("./reference/parcoursup");
const afReference = require("./reference/affelnet");
const psPertinence = require("./pertinence/parcoursup");
const afPertinence = require("./pertinence/affelnet");
const afCoverage = require("./affelnet/coverage");
const afReconciliation = require("./affelnet/reconciliation");

const clean = require("./clean");
const { rebuildEsIndex } = require("./esIndex/esIndex");
const { importEtablissements } = require("./etablissements");
const { spawn } = require("child_process");

const { mongoose } = require("../common/mongodb");
const { initTcoModel, rncpImporter, bcnImporter } = require("@mission-apprentissage/tco-service-node");

runScript(async ({ catalogue }) => {
  try {
    logger.info(`Start all jobs`);
    await clean();

    // import tco
    await initTcoModel(mongoose);
    await bcnImporter();
    await rncpImporter();

    await importEtablissements(catalogue);

    // rco
    await rcoImporter();
    await rcoConverter();

    // await trainingsUpdater(); // ~ 3 heures 40 minutes => ~ 59 minutes
    const trainingsUpdater = spawn("node", ["./src/jobs/trainingsUpdater/index.js"]);
    for await (const data of trainingsUpdater.stdout) {
      console.log(`trainingsUpdater: ${data}`);
    }

    // parcoursup
    await psReference(); // ~ 34 minutes => ~ 30 secondes
    await psPertinence(); // ~ 8 secondes

    // affelnet
    await afCoverage();
    await afReconciliation();
    await afReference(); // ~ 50 minutes => ~ 5 minutes
    await afPertinence();

    // es
    const filter = { published: true };
    await rebuildEsIndex("convertedformation", false, filter); // ~ 44 minutes => ~ 22 minutes
  } catch (error) {
    logger.error(error);
  }
});
