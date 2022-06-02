const logger = require("../../../common/logger");
const controller = require("./controller");

const { runScript } = require("../../scriptWrapper");

const afPerimetre = async () => {
  try {
    logger.info(" -- Start affelnet perimetre -- ");

    await controller.run();

    logger.info(" -- End of affelnet perimetre -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = afPerimetre;

if (process.env.standalone) {
  runScript(async () => {
    await afPerimetre();
  });
}
