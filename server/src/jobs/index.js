const { runScript } = require("./scriptWrapper");
const logger = require("../common/logger");
const rcoImporter = require("./rcoImporter");
const rcoConverter = require("./rcoConverter");

runScript(async () => {
  try {
    logger.info(`Start all jobs`);
    await rcoImporter();
    await rcoConverter();
  } catch (error) {
    logger.error(error);
  }
});
