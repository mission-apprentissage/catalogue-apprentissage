const logger = require("../../../common/logger");
const controller = require("./controller");
const counter = require("./counter");
const perimetre = require("./perimetre");

const { runScript } = require("../../scriptWrapper");

const psPerimetre = async () => {
  try {
    logger.info({ type: "job" }, " -- Start psup perimetre -- ");

    console.log("\nCompteurs avant :\n");
    await counter.run();

    console.log("\nApplication des règles de périmètre :\n");

    await controller.run();

    console.log("\nVérification du périmètre :\n");

    await perimetre.run();

    console.log("\nCompteurs après :\n");
    await counter.run();

    logger.info({ type: "job" }, " -- End of psup perimetre -- ");
  } catch (error) {
    logger.error({ type: "job" }, error);
  }
};

module.exports = { psPerimetre };

if (process.env.standalone) {
  runScript(async () => {
    await psPerimetre();
  });
}
