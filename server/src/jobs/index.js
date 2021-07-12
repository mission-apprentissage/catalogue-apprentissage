const { runScript } = require("./scriptWrapper");
const logger = require("../common/logger");
const rcoImporter = require("./rcoImporter");
const rcoConverter = require("./rcoConverter");
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
const { ConvertedFormation } = require("../common/model");

const { rncpImporter, bcnImporter, onisepImporter } = require("@mission-apprentissage/tco-service-node");

const KIT_LOCAL_PATH = "/data/uploads/CodeDiplome_RNCP_latest_kit.csv";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

runScript(async ({ catalogue, db }) => {
  try {
    logger.info(`Start all jobs`);

    ConvertedFormation.pauseAllMongoosaticHooks();

    await clean();

    // import tco
    await bcnImporter();
    await sleep(30000);
    await onisepImporter(db);
    await sleep(30000);
    await rncpImporter(KIT_LOCAL_PATH);
    await sleep(30000);

    await importEtablissements(catalogue);
    await sleep(30000);
    // rco
    await rcoImporter();
    await sleep(30000);
    await rcoConverter();
    await sleep(30000);

    // ~ 3 heures 40 minutes => ~ 59 minutes
    const trainingsUpdater = spawn("node", ["./src/jobs/trainingsUpdater/index.js"]);
    for await (const data of trainingsUpdater.stdout) {
      console.log(`trainingsUpdater: ${data}`);
    }
    await sleep(30000);

    // parcoursup
    const psCoverage = spawn("node", ["./src/jobs/parcoursup/2021/coverage.js"]);
    for await (const data of psCoverage.stdout) {
      console.log(`psCoverage: ${data}`);
    }
    await sleep(30000);

    await psReference(); // ~ 34 minutes => ~ 30 secondes
    await sleep(30000);
    await psPertinence(); // ~ 8 secondes
    await sleep(30000);
    // affelnet
    await afCoverage(); // ~ 47 minutes => ~ 12 minutes
    await sleep(30000);
    await afReconciliation();
    await sleep(30000);
    await afReference(); // ~ 50 minutes => ~ 5 minutes
    await sleep(30000);
    await afPertinence();
    await sleep(30000);

    ConvertedFormation.startAllMongoosaticHooks();

    // es
    const filter = { published: true };
    await rebuildEsIndex("convertedformation", false, filter); // ~ 44 minutes => ~ 22 minutes
  } catch (error) {
    logger.error(error);
  }
});
