const logger = require("../../../common/logger");
const controller = require("./controller");

const { runScript } = require("../../scriptWrapper");

const afReference = async () => {
  try {
    logger.info(" -- Start affelnet reference -- ");

    await controller.run();

    logger.info(" -- End of affelnet reference -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = afReference;

if (process.env.standalone) {
  runScript(async () => {
    await afReference();
  });
}
