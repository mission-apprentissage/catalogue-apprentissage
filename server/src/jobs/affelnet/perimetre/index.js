const logger = require("../../../common/logger");
const controller = require("./controller");
const perimetre = require("./perimetre");
const session = require("./session");
const previousSession = require("./previousSession");
const counter = require("./counter");

const { runScript } = require("../../scriptWrapper");

const afPerimetre = async () => {
  try {
    logger.info({ type: "job" }, " -- AFFELNET | PERIMETRE : ⏳ -- ");

    logger.info({ type: "job" }, "∙ Compteurs avant :");
    await counter.run();

    logger.info({ type: "job" }, "∙ Application des règles de périmètre :");
    await controller.run();

    logger.info({ type: "job" }, "∙ Vérification du périmètre :");
    await perimetre.run();

    logger.info({ type: "job" }, "∙ Vérification des dates de session :");
    await session.run();
    await previousSession.run();

    logger.info({ type: "job" }, "∙ Compteurs après :");
    await counter.run();

    logger.info({ type: "job" }, " -- AFFELNET | PERIMETRE : ✅ -- ");
  } catch (error) {
    logger.error({ type: "job" }, error);
    logger.error({ type: "job" }, " -- AFFELNET | PERIMETRE : ❌ -- ");
  }
};

module.exports = { afPerimetre };

if (process.env.standalone) {
  runScript(async () => {
    await afPerimetre();
  });
}
