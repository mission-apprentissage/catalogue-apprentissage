const path = require("path");
const { tcoJobs, downloadBcnTables, importBcnTables, bcnImporter } = require("@mission-apprentissage/tco-service-node");
const { runScript, enableAlertMessage, disableAlertMessage } = require("./scriptWrapper");
const logger = require("../common/logger");
const { Formation, Etablissement } = require("../common/models");
const { rebuildEsIndex } = require("./esIndex/esIndex");
const { parcoursupJobs } = require("./parcoursup");
const { affelnetJobs } = require("./affelnet");
const { etablissementsJobs } = require("./etablissements");
const { formationsJobs } = require("./formations");
const { collectPreviousSeasonStats } = require("./formations/previousSeasonStats");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

runScript(async ({ db }) => {
  try {
    logger.info({ type: "job" }, `ALL JOBS ⏳`);

    // TCO jobs
    await bcnImporter();
    await sleep(10000);

    Etablissement.pauseAllMongoosaticHooks();

    // Etablissements
    await etablissementsJobs(); // ~ 20 minutes
    await sleep(10000);

    // Formations
    Formation.pauseAllMongoosaticHooks();
    await formationsJobs();
    await sleep(10000);

    // Parcoursup & Affelnet
    await parcoursupJobs(); // ~ 10 minutes  // maj des rapprochements & étiquettes périmètre & calcul stats
    await affelnetJobs(); // ~ 15 minutes  // maj des rapprochements & étiquettes périmètre & calcul stats
    await collectPreviousSeasonStats({ store: false, compare: true }); // ~ 5 minutes // maj des stats de la saison précédente
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

    logger.info({ type: "job" }, `ALL JOBS ✅`);
  } catch (error) {
    logger.error({ type: "job" }, error);
    logger.error({ type: "job" }, `ALL JOBS ❌`);
  }
});
