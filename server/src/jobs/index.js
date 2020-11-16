const { runScript } = require("./scriptWrapper");
const logger = require("../common/logger");
const rcoImporter = require("./rcoImporter");

runScript(async () => {
  try {
    logger.info(`Start all jobs`);
    await rcoImporter();
  } catch (error) {
    logger.error(error);
  }
});
