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
const psCoverage = require("./parcoursup/2021/coverage");
const afReconciliation = require("./affelnet/reconciliation");
const psReconciliation = require("./parcoursup/2021/reconciliation");

const clean = require("./clean");
const { rebuildEsIndex } = require("./esIndex/esIndex");
const { importEtablissements } = require("./etablissements");
const { spawn } = require("child_process");

const { rncpImporter, bcnImporter, onisepImporter } = require("@mission-apprentissage/tco-service-node");

const path = require("path");

const KIT_LOCAL_PATH = path.join(__dirname, "KitApprentissage.latest.xlsx");

runScript(async ({ catalogue, db }) => {
  try {
    logger.info(`Start all jobs`);
    await clean();

    // import tco
    await bcnImporter();
    await onisepImporter(db);
    await rncpImporter(KIT_LOCAL_PATH);

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
    await psCoverage();
    await psReconciliation();
    await psReference(); // ~ 34 minutes => ~ 30 secondes
    await psPertinence(); // ~ 8 secondes

    // affelnet
    await afCoverage(); // ~ 47 minutes => ~ 12 minutes
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
