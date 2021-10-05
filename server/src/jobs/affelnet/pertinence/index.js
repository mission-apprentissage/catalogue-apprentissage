const logger = require("../../../common/logger");
const controller = require("./controller");

const { runScript } = require("../../scriptWrapper");

const afPertinence = async () => {
  try {
    logger.info(" -- Start affelnet pertinence -- ");

    await controller.run();

    logger.info(" -- End of affelnet pertinence -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = afPertinence;

if (process.env.standalone) {
  runScript(async () => {
    await afPertinence();
  });
}
