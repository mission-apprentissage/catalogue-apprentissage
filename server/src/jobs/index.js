const { runScript } = require("./scriptWrapper");
const logger = require("../common/logger");
const rcoImporter = require("./rcoImporter");
const rcoConverter = require("./rcoConverter");
const psReference = require("./psReference");
const afReference = require("./afReference");
const clean = require("./clean");
const importEtablissement = require("./etablissements");

runScript(async () => {
  try {
    logger.info(`Start all jobs`);
    await clean();
    await rcoImporter();
    await rcoConverter();
    await psReference();
    await afReference();
    await importEtablissement();
  } catch (error) {
    logger.error(error);
  }
});
