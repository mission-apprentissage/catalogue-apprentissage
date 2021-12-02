const crypto = require("crypto");
const { spawn } = require("child_process");
const path = require("path");
const {
  rncpImporter,
  bcnImporter,
  onisepImporter,
  conventionFilesImporter,
} = require("@mission-apprentissage/tco-service-node");

const { runScript } = require("./scriptWrapper");
const logger = require("../common/logger");
const { Formation } = require("../common/model");
const { rebuildEsIndex } = require("./esIndex/esIndex");

const rcoImporter = require("./rcoImporter");
const rcoConverter = require("./rcoConverter");
// const psReference = require("./parcoursup/reference");
const afReference = require("./affelnet/reference");
const psPerimetre = require("./parcoursup/perimetre");
// const psUpdateMatchInfo = require("./parcoursup/updateMatchInfo");
const afPerimetre = require("./affelnet/perimetre");
const afCoverage = require("./affelnet/coverage");
const afReconciliation = require("./affelnet/reconciliation");
const { EtablissementsUpdater } = require("./EtablissementsUpdater");
const { findAndUpdateSiegeSocial } = require("./EtablissementsUpdater/orphans");
const parcoursupExport = require("./parcoursup/export");
const psCoverage = require("./parcoursup/coverage");

const KIT_LOCAL_PATH = "/data/uploads/CodeDiplome_RNCP_latest_kit.csv";
const CONVENTION_FILES_DIR = path.join(__dirname, "conventionFilesImporter/assets");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

runScript(async ({ db }) => {
  try {
    logger.info(`Start all jobs`);

    Formation.pauseAllMongoosaticHooks();

    // import tco
    await bcnImporter();
    await sleep(30000);
    await onisepImporter(db);
    await sleep(30000);
    await conventionFilesImporter(db, CONVENTION_FILES_DIR);
    await sleep(30000);
    await rncpImporter(KIT_LOCAL_PATH);
    await sleep(30000);

    await EtablissementsUpdater();
    await findAndUpdateSiegeSocial();
    await sleep(30000);

    let uuidReport;
    if (process.env.CATALOGUE_APPRENTISSAGE_RCO_IMPORT_ENABLED === "true") {
      // rco
      console.log("Import RCO enabled, starting...");
      uuidReport = await rcoImporter();
      await sleep(30000);
      if (!uuidReport) {
        uuidReport = crypto.randomBytes(16).toString("hex");
      }
      await rcoConverter(uuidReport);
      await sleep(30000);
    } else {
      console.log("Import RCO disabled, skipping...");
    }

    if (!uuidReport) {
      uuidReport = crypto.randomBytes(16).toString("hex");
    }
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
    await psCoverage();
    await sleep(30000);

    // await psReference(); // ~ 34 minutes => ~ 30 secondes
    // await sleep(30000);

    // await psUpdateMatchInfo();
    // await sleep(30000);

    if (process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_EXPORT_ENABLED === "true") {
      await parcoursupExport.run();
      await sleep(30000);
    }

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
    await rebuildEsIndex("etablissements", false);
  } catch (error) {
    logger.error(error);
  }
});
