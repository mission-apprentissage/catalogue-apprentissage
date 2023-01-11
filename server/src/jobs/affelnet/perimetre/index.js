const logger = require("../../../common/logger");
const controller = require("./controller");
const counter = require("./counter");
const perimetre = require("./perimetre");

const { runScript } = require("../../scriptWrapper");

const afPerimetre = async () => {
  try {
    logger.info(" -- Start affelnet perimetre -- ");

    console.log("Compteurs avant :");
    await counter.run();

    await controller.run();

    await perimetre.run();

    console.log("Compteurs après :");
    await counter.run();

    logger.info(" -- End of affelnet perimetre -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = { afPerimetre };

if (process.env.standalone) {
  runScript(async () => {
    await afPerimetre();
  });
}
