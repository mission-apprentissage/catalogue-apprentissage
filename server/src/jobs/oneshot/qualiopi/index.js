const path = require("path");
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { conventionFilesImporter } = require("@mission-apprentissage/tco-service-node");
const etablissementUpdater = require("../../etablissements/EtablissementsUpdater/updater/updater");
const { Formation } = require("../../../common/model");
const { rebuildEsIndex } = require("../../esIndex/esIndex");
const parcoursupJobs = require("../../parcoursup");
const affelnetJobs = require("../../affelnet");
const trainingsUpdater = require("../../formations/trainingsUpdater");

const CONVENTION_FILES_DIR = path.join(__dirname, "../../conventionFilesImporter/assets");

runScript(async ({ db }) => {
  logger.info("Starting qualiopi update job");

  await conventionFilesImporter(db, CONVENTION_FILES_DIR);

  await etablissementUpdater.run(
    {},
    {
      scope: {
        siret: false,
        geoloc: false,
        conventionnement: true,
        onisep: false,
        cfadock: false,
      },
    }
  );

  // Formations
  Formation.pauseAllMongoosaticHooks();
  await trainingsUpdater({ noMail: true });

  await parcoursupJobs();
  await affelnetJobs();

  // eS
  Formation.startAllMongoosaticHooks();
  await rebuildEsIndex();

  logger.info("End qualiopi update job");
});
