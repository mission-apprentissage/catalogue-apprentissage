const logger = require("../../../common/logger");
const controller = require("./controller");

const { runScript } = require("../../scriptWrapper");

const psReference = async () => {
  try {
    logger.info(" -- Start psup reference -- ");

    await controller.run();

    logger.info(" -- End of psup reference -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = psReference;

if (process.env.standalone) {
  runScript(async () => {
    await psReference();
  });
}
