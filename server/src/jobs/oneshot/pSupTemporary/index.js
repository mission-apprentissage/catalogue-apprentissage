const logger = require("../../../common/logger");
const controller = require("./controller");

const { runScript } = require("../../scriptWrapper");

const run = async () => {
  try {
    logger.info(" -- Start psup temporary -- ");

    await controller.run();

    logger.info(" -- End of psup temporary -- ");
  } catch (err) {
    logger.error(err);
  }
};

runScript(async () => {
  await run();
});
