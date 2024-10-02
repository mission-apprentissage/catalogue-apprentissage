const logger = require("../../../common/logger");
const controller = require("./controller");
const replace = require("./replace");
const counter = require("./counter");
const perimetre = require("./perimetre");
const session = require("./session");
const previousSession = require("./previousSession");

const { runScript } = require("../../scriptWrapper");

const psPerimetre = async () => {
  try {
    logger.info({ type: "job" }, " -- PARCOURSUP | PERIMETRE : ⏳ -- ");

    logger.info({ type: "job" }, "∙ Compteurs avant :");
    await counter.run();

    logger.info({ type: "job" }, "∙ Traitement des 'annule et remplace':");
    await replace.run();

    logger.info({ type: "job" }, "∙ Application des règles de périmètre :");
    await controller.run();

    logger.info({ type: "job" }, "∙ Vérification du périmètre :");
    await perimetre.run();

    logger.info({ type: "job" }, "∙ Vérification des dates de session :");
    await session.run();
    await previousSession.run();

    logger.info({ type: "job" }, "∙ Compteurs après :");
    await counter.run();

    logger.info({ type: "job" }, " -- PARCOURSUP | PERIMETRE : ✅ -- ");
  } catch (error) {
    logger.error({ type: "job" }, error);
    logger.error({ type: "job" }, " -- PARCOURSUP | PERIMETRE : ❌ -- ");
  }
};

module.exports = { psPerimetre };

if (process.env.standalone) {
  runScript(async () => {
    await psPerimetre();
  });
}
