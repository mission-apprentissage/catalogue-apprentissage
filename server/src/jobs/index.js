const { runScript } = require("./scriptWrapper");
const logger = require("../common/logger");
const rcoImporter = require("./rcoImporter");
const rcoConverter = require("./rcoConverter");
const psReference = require("./psReference");
const afReference = require("./afReference");
const clean = require("./clean");

runScript(async () => {
  try {
    logger.info(`Start all jobs`);
    await clean();
    await rcoImporter();
    await rcoConverter();
    await psReference();
    await afReference();
  } catch (error) {
    logger.error(error);
  }
});
