const logger = require("../../../common/logger");
const controlller = require("./controlller");

const { runScript } = require("../../scriptWrapper");

const run = async () => {
  try {
    logger.info(" -- Start psup temporary -- ");

    await controlller.run();

    logger.info(" -- End of psup temporary -- ");
  } catch (err) {
    logger.error(err);
  }
};

runScript(async () => {
  await run();
});
