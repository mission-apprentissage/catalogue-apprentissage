const { runScript, enableAlertMessage, disableAlertMessage } = require("./scriptWrapper");
const logger = require("../common/logger");
const { Formation, Etablissement } = require("../common/model");
const { rebuildEsIndex } = require("./esIndex/esIndex");
const parcoursupJobs = require("./parcoursup");
const affelnetJobs = require("./affelnet");
const etablissementsJobs = require("./etablissements");
const formationsJobs = require("./formations");
const { collectPreviousSeasonStats } = require("./formations/previousSeasonStats");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

runScript(async () => {
  try {
    logger.info(`Start all jobs`);

    Etablissement.pauseAllMongoosaticHooks();

    // Etablissements
    await etablissementsJobs();
    await sleep(10000);

    // Formations
    Formation.pauseAllMongoosaticHooks();
    await formationsJobs();
    await sleep(10000);

    // Parcoursup & Affelnet
    await parcoursupJobs(); // ~ 10 minutes  // maj des rapprochements & étiquettes périmètre & calcul stats
    await affelnetJobs(); // ~ 15 minutes  // maj des rapprochements & étiquettes périmètre & calcul stats
    await collectPreviousSeasonStats();
    await sleep(10000);

    // Elastic
    await enableAlertMessage();
    await rebuildEsIndex("etablissements"); // ~ 5 minutes // maj elastic search (recherche des établissements)
    await disableAlertMessage();
    Etablissement.startAllMongoosaticHooks();

    await enableAlertMessage();
    await rebuildEsIndex("formations"); // ~ 5 minutes // maj elastic search (recherche des formations)
    await rebuildEsIndex("parcoursupformations"); // ~ 5 minutes // maj elastic search (recherche des rapprochements)
    await disableAlertMessage();
    Formation.startAllMongoosaticHooks();
  } catch (error) {
    logger.error(error);
  }
});
