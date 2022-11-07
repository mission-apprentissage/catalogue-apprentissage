const path = require("path");
const { tcoJobs } = require("@mission-apprentissage/tco-service-node");
const { runScript, enableAlertMessage, disableAlertMessage } = require("./scriptWrapper");
const logger = require("../common/logger");
const { Formation, Etablissement } = require("../common/model");
const { rebuildEsIndex } = require("./esIndex/esIndex");
const etablissementsJobs = require("./etablissements");
const formationsJobs = require("./formations");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const KIT_LOCAL_PATH = "/data/uploads/CodeDiplome_RNCP_latest_kit.csv";
const CONVENTION_FILES_DIR = path.join(__dirname, "conventionFilesImporter/assets");

runScript(async ({ db }) => {
  try {
    logger.info(`Start all jobs`);

    // TCO jobs
    await tcoJobs(db, CONVENTION_FILES_DIR, KIT_LOCAL_PATH); // ~ 15 minutes // Import des tables de correspondance
    await sleep(30000);

    Etablissement.pauseAllMongoosaticHooks();

    // Etablissements
    await etablissementsJobs();
    await sleep(10000);

    // Formations
    Formation.pauseAllMongoosaticHooks();
    await formationsJobs();
    await sleep(10000);

    // Elastic
    await enableAlertMessage();
    await rebuildEsIndex("etablissements"); // ~ 5 minutes // maj elastic search (recherche des établissements)
    await disableAlertMessage();
    Etablissement.startAllMongoosaticHooks();

    await enableAlertMessage();
    await rebuildEsIndex("formations"); // ~ 5 minutes // maj elastic search (recherche des formations)
    await disableAlertMessage();
    Formation.startAllMongoosaticHooks();
  } catch (error) {
    logger.error(error);
  }
});
