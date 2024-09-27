const path = require("path");
const { runScript, enableAlertMessage, disableAlertMessage } = require("./scriptWrapper");
const logger = require("../common/logger");
const { Formation, CampagneStart } = require("../common/models");
const { rebuildEsIndex } = require("./esIndex/esIndex");
const { psStartCampagne } = require("./parcoursup/startCampagne");
const { afStartCampagne } = require("./affelnet/startCampagne");
const { psPerimetre } = require("./parcoursup/perimetre");
const { afPerimetre } = require("./affelnet/perimetre");
const { psStats } = require("./parcoursup/stats");
const { afStats } = require("./affelnet/stats");
const { getCampagneStartDate } = require("../common/utils/rulesUtils");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

runScript(async ({}) => {
  try {
    logger.info({ type: "job" }, `START CAMPAGNE ⏳`);

    await collectPreviousSeasonStats({ store: true, compare: false });

    await CampagneStart.create({});

    logger.info(`Nouvelle date de début de campagne définie : ${await getCampagneStartDate()}`);

    Formation.pauseAllMongoosaticHooks();

    await psStartCampagne();
    await psPerimetre();
    await psStats();

    await afStartCampagne();
    await afPerimetre();
    await afStats();

    await collectPreviousSeasonStats({ store: false, compare: true });

    Formation.startAllMongoosaticHooks();

    await enableAlertMessage();
    await rebuildEsIndex("formations");
    await disableAlertMessage();

    logger.info({ type: "job" }, `START CAMPAGNE ✅`);
  } catch (error) {
    logger.error({ type: "job" }, error);
    logger.error({ type: "job" }, `START CAMPAGNE ❌`);
  }
});
