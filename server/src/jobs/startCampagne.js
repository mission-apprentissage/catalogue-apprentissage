const { runScript, enableAlertMessage, disableAlertMessage } = require("./scriptWrapper");
const logger = require("../common/logger");
const { Formation, CampagneStart } = require("../common/models");
const { rebuildEsIndex } = require("./esIndex/esIndex");
const { psStartCampagne } = require("./parcoursup/startCampagne");
const { afStartCampagne } = require("./affelnet/startCampagne");
const { psPerimetre } = require("./parcoursup/perimetre");
const { afPerimetre } = require("./affelnet/perimetre");
const { psConsoleStats } = require("./parcoursup/stats");
const { afConsoleStats } = require("./affelnet/stats");
const { getCampagneStartDate } = require("../common/utils/rulesUtils");
const { collectPreviousSeasonStats } = require("./formations/previousSeasonStats");

runScript(async ({}) => {
  try {
    logger.info({ type: "job" }, `START CAMPAGNE ⏳`);

    await collectPreviousSeasonStats({ store: true, compare: false });

    await CampagneStart.create({});

    logger.info(`Nouvelle date de début de campagne définie : ${await getCampagneStartDate()}`);

    Formation.pauseAllMongoosaticHooks();

    await psStartCampagne();
    await psPerimetre();
    await psConsoleStats();

    await afStartCampagne();
    await afPerimetre();
    await afConsoleStats();

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
