const logger = require("../../../common/logger");
const controller = require("./controller");
const perimetre = require("./perimetre");

const { runScript } = require("../../scriptWrapper");

const psPerimetre = async () => {
  try {
    logger.info(" -- Start psup perimetre -- ");

    const results = await controller.run();

    await perimetre.run();

    logger.info(" -- End of psup perimetre -- ");

    return results;
  } catch (err) {
    logger.error(err);
  }
};

module.exports = { psPerimetre };

if (process.env.standalone) {
  runScript(async () => {
    await psPerimetre();
  });
}
