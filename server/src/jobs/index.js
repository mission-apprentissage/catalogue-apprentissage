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
const checkUai = require("./checkUai");
const afReinitStatus = require("./affelnet/reinitStatus");

const KIT_LOCAL_PATH = "/data/uploads/CodeDiplome_RNCP_latest_kit.csv";
const CONVENTION_FILES_DIR = path.join(__dirname, "conventionFilesImporter/assets");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

runScript(async ({ db }) => {
  try {
    logger.info(`Start all jobs`);

    await afReinitStatus(); // Réinitialisation du statut Affelnet des formations 'en attente de publication' lors de la clôture des voeux (1 septembre)

    // TCO jobs
    await tcoJobs(db, CONVENTION_FILES_DIR, KIT_LOCAL_PATH); // ~ 15 minutes // Import des tables de correspondance
    await sleep(30000);

    // Etablissements
    await etablissementsJobs(); // ~ 2h30 // mise à jour des établissements (api entreprise / qualiopi)
    await sleep(30000);

    // Formations
    Formation.pauseAllMongoosaticHooks();
    await formationsJobs(); // ~ 1h05 // màj des formations (import rco / qualiopi / bcn / rncp) & envoi des mails de rapports
    await sleep(30000);

    // Parcoursup & Affelnet
    await parcoursupJobs(); // ~ 10 minutes  // maj des rapprochements & étiquettes périmètre
    await affelnetJobs(); // ~ 15 minutes  // maj des rapprochements & étiquettes périmètre

    await sleep(30000);
    await checkUai(); // ~ 1 minutes //maj de la validité des UAIs pour établissements et formations

    // eS
    Formation.startAllMongoosaticHooks();
    await rebuildEsIndex(); // ~ 5 minutes // maj elastic search (recherche des formations / établissements / rapprochements)

    // total time for execution ~ 4h20
  } catch (error) {
    logger.error(error);
  }
});
