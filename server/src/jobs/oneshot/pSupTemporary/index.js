const logger = require("../../../common/logger");
const controller = require("./controller");

const { runScript } = require("../../scriptWrapper");

const pSupLoader = async () => {
  try {
    logger.info(" -- Start psup temporary -- ");

    await controller.run();

    logger.info(" -- End of psup temporary -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = pSupLoader;

if (process.env.standalone) {
  runScript(async () => {
    await pSupLoader();
  });
}
