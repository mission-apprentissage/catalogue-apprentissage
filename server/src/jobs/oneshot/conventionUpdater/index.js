const path = require("path");
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { rebuildEsIndex } = require("../../esIndex/esIndex");
const { conventionFilesImporter } = require("@mission-apprentissage/tco-service-node");
const { run } = require("../../etablissements/EtablissementsUpdater/updater/updater");

const CONVENTION_FILES_DIR = path.join(__dirname, "../../conventionFilesImporter/assets");

runScript(async ({ db }) => {
  try {
    logger.info(`Convention updater ${CONVENTION_FILES_DIR}`);
    await conventionFilesImporter(db, CONVENTION_FILES_DIR);

    const filter = { ferme: false };

    const options = {
      withHistoryUpdate: true,
      scope: {
        siret: false,
        geoloc: false,
        conventionnement: true,
        onisep: false,
      },
    };
    await run(filter, options);

    await rebuildEsIndex("etablissements", false);
  } catch (error) {
    logger.error(error);
  }
});
