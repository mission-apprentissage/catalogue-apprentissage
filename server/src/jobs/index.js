const path = require("path");
const { tcoJobs } = require("@mission-apprentissage/tco-service-node");
const { runScript } = require("./scriptWrapper");
const logger = require("../common/logger");
const { Formation } = require("../common/model");
const { rebuildEsIndex } = require("./esIndex/esIndex");
const parcoursupJobs = require("./parcoursup");
const affelnetJobs = require("./affelnet");
const etablissementsJobs = require("./etablissements");
const formationsJobs = require("./formations");

const KIT_LOCAL_PATH = "/data/uploads/CodeDiplome_RNCP_latest_kit.csv";
const CONVENTION_FILES_DIR = path.join(__dirname, "conventionFilesImporter/assets");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

runScript(async ({ db }) => {
  try {
    logger.info(`Start all jobs`);

    // TCO jobs
    await tcoJobs(db, CONVENTION_FILES_DIR, KIT_LOCAL_PATH);
    await sleep(30000);

    // Etablissements
    await etablissementsJobs();
    await sleep(30000);

    // Formations
    Formation.pauseAllMongoosaticHooks();
    await formationsJobs();
    await sleep(30000);

    // Parcoursup & Affelnet
    await parcoursupJobs();
    await affelnetJobs();

    // eS
    Formation.startAllMongoosaticHooks();
    await rebuildEsIndex();
  } catch (error) {
    logger.error(error);
  }
});
