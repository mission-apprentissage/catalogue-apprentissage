const logger = require("../../../common/logger");
const controller = require("./controller");

const { runScript } = require("../../scriptWrapper");

const psPertinence = async () => {
  try {
    logger.info(" -- Start psup pertinence -- ");

    await controller.run();

    logger.info(" -- End of psup pertinence -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = psPertinence;

if (process.env.standalone) {
  runScript(async () => {
    await psPertinence();
  });
}
