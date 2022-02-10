const { bcnImporter } = require("@mission-apprentissage/tco-service-node");
const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");

runScript(async () => {
  try {
    logger.info(`Start bcn jobs`);

    await bcnImporter();

    logger.info(`End bcn jobs`);
  } catch (error) {
    logger.error(error);
  }
});
