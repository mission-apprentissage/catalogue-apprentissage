const logger = require("../../../common/logger");
const controller = require("./controller");
const perimetre = require("./perimetre");
const counter = require("./counter");

const { runScript } = require("../../scriptWrapper");

const afPerimetre = async () => {
  try {
    logger.info(" -- Start affelnet perimetre -- ");

    console.log("\nCompteurs avant :\n");
    await counter.run();

    console.log("\nApplication des règles de périmètre :\n");

    await controller.run();

    console.log("\nVérification du périmètre :\n");

    await perimetre.run();

    console.log("\nCompteurs après :\n");
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
