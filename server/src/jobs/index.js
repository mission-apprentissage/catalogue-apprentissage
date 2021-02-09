const { runScript } = require("./scriptWrapper");
const logger = require("../common/logger");
const rcoImporter = require("./rcoImporter");
const rcoConverter = require("./rcoConverter");
const trainingsUpdater = require("./trainingsUpdater");
const psReference = require("./psReference");
const afReference = require("./afReference");
const clean = require("./clean");
const { importEtablissements } = require("./etablissements");

runScript(async ({ catalogue }) => {
  try {
    logger.info(`Start all jobs`);
    await clean();
    await rcoImporter();
    await rcoConverter();
    await trainingsUpdater();
    await psReference();
    await afReference();
    await importEtablissements(catalogue);
  } catch (error) {
    logger.error(error);
  }
});
