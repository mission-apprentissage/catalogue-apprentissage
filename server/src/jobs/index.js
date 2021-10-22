const { runScript } = require("./scriptWrapper");
const logger = require("../common/logger");
const rcoImporter = require("./rcoImporter");
const rcoConverter = require("./rcoConverter");
// const psReference = require("./parcoursup/reference");
const afReference = require("./affelnet/reference");
const psPerimetre = require("./parcoursup/perimetre");
const psUpdateMatchInfo = require("./parcoursup/updateMatchInfo");
const afPerimetre = require("./affelnet/perimetre");
const afCoverage = require("./affelnet/coverage");
const afReconciliation = require("./affelnet/reconciliation");
const crypto = require("crypto");

const { rebuildEsIndex } = require("./esIndex/esIndex");
const { importEtablissements } = require("./etablissements");
const { spawn } = require("child_process");
const { Formation } = require("../common/model");

const { rncpImporter, bcnImporter, onisepImporter } = require("@mission-apprentissage/tco-service-node");

const KIT_LOCAL_PATH = "/data/uploads/CodeDiplome_RNCP_latest_kit.csv";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

runScript(async ({ catalogue, db }) => {
  try {
    logger.info(`Start all jobs`);

    Formation.pauseAllMongoosaticHooks();

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
    let uuidReport = await rcoImporter();
    await sleep(30000);
    if (!uuidReport) {
      uuidReport = crypto.randomBytes(16).toString("hex");
    }
    await rcoConverter(uuidReport);
    await sleep(30000);

    // ~ 3 heures 40 minutes => ~ 59 minutes
    const trainingsUpdater = spawn("node", [
      "./src/jobs/trainingsUpdater/index.js",
      `--uuidReport=${uuidReport}`,
      "--withCodePostal",
      "--limit=1", // handle updates 1 by 1 to prevent timeout of api adresse
    ]);
    for await (const data of trainingsUpdater.stdout) {
      console.log(`trainingsUpdater: ${data}`);
    }
    await sleep(30000);

    await psPerimetre(); // ~ 8 secondes
    await sleep(30000);

    // parcoursup
    const psCoverage = spawn("node", ["./src/jobs/parcoursup/coverage.js"]);
    for await (const data of psCoverage.stdout) {
      console.log(`psCoverage: ${data}`);
    }
    await sleep(30000);

    // await psReference(); // ~ 34 minutes => ~ 30 secondes
    // await sleep(30000);

    await psUpdateMatchInfo();
    await sleep(30000);

    // affelnet
    await afCoverage(); // ~ 47 minutes => ~ 12 minutes
    await sleep(30000);
    await afReconciliation();
    await sleep(30000);
    await afReference(); // ~ 50 minutes => ~ 5 minutes
    await sleep(30000);
    await afPerimetre();
    await sleep(30000);

    Formation.startAllMongoosaticHooks();

    // es
    const filter = { published: true };
    await rebuildEsIndex("formation", false, filter); // ~ 44 minutes => ~ 22 minutes
    await rebuildEsIndex("psformations", false); // ~ 3 minutes
  } catch (error) {
    logger.error(error);
  }
});
