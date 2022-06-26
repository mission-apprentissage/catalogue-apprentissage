const path = require("path");
const { tcoJobs } = require("@mission-apprentissage/tco-service-node");
const { runScript, enableAlertMessage, disableAlertMessage } = require("./scriptWrapper");
const logger = require("../common/logger");
const { Formation, Etablissement } = require("../common/model");
const { rebuildEsIndex } = require("./esIndex/esIndex");
const parcoursupJobs = require("./parcoursup");
const affelnetJobs = require("./affelnet");
const etablissementsJobs = require("./etablissements");
const formationsJobs = require("./formations");
const checkUai = require("./checkUai");
const etablissementTags = require("./etablissements/tags");
const collectPreviousSeasonStats = require("./formations/previousSeasonStats");

const KIT_LOCAL_PATH = "/data/uploads/CodeDiplome_RNCP_latest_kit.csv";
const CONVENTION_FILES_DIR = path.join(__dirname, "conventionFilesImporter/assets");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

runScript(async ({ db }) => {
  const today = new Date();

  try {
    logger.info(`Start all jobs`);

    // TCO jobs
    await tcoJobs(db, CONVENTION_FILES_DIR, KIT_LOCAL_PATH); // ~ 15 minutes // Import des tables de correspondance
    await sleep(30000);

    Etablissement.pauseAllMongoosaticHooks();

    // Etablissements
    await etablissementsJobs(); // ~ 2h30 // mise à jour des établissements (api entreprise / qualiopi)
    await sleep(30000);

    // Formations
    Formation.pauseAllMongoosaticHooks();
    await formationsJobs(); // ~ 1h05 // màj des formations (import rco / qualiopi / bcn / rncp) & envoi des mails de rapports
    await sleep(30000);

    // Tags Etablissements
    if (!(today.getDay() % 6)) {
      // Uniquement le samedi
      await etablissementTags(); // ~ 1h // màj tags etablissements (étiquettes 2022 / 2023...)
    }

    await enableAlertMessage();
    await rebuildEsIndex("etablissements"); // ~ 5 minutes // maj elastic search (recherche des établissements)
    await disableAlertMessage();
    Etablissement.startAllMongoosaticHooks();

    // Parcoursup & Affelnet
    await parcoursupJobs(); // ~ 10 minutes  // maj des rapprochements & étiquettes périmètre & calcul stats
    await affelnetJobs(); // ~ 15 minutes  // maj des rapprochements & étiquettes périmètre & calcul stats
    await collectPreviousSeasonStats();
    await sleep(30000);

    await checkUai(); // ~ 1 minutes //maj de la validité des UAIs pour établissements et formations

    Formation.startAllMongoosaticHooks();

    // eS
    await enableAlertMessage();
    await rebuildEsIndex("formations"); // ~ 5 minutes // maj elastic search (recherche des formations)
    await rebuildEsIndex("parcoursupformations"); // ~ 5 minutes // maj elastic search (recherche des rapprochements)
    await disableAlertMessage();

    // if (process.env.CATALOGUE_APPRENTISSAGE_RCO_DUAL_CONTROL_ENABLED) {
    //   // double commande
    //   await dualControl();
    // }

    // total time for execution ~ 4h20
  } catch (error) {
    logger.error(error);
  }
});
