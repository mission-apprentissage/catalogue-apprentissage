const logger = require("../../../common/logger");
const controller = require("./controller");
const initial = require("./initial");
const replace = require("./replace");
const counter = require("./counter");
const perimetre = require("./perimetre");
const session = require("./session");
const previousSession = require("./previousSession");
const differences = require("./differences");

const { runScript } = require("../../scriptWrapper");

const afPerimetre = async () => {
  try {
    logger.info({ type: "job" }, " -- AFFELNET | PERIMETRE : ⏳ -- ");

    logger.info({ type: "job" }, "∙ Compteurs avant :");
    await counter.run();

    logger.info({ type: "job" }, "∙ Traitement des 'annule et remplace':");
    await replace.run();

    logger.info({ type: "job" }, "∙ Application des règles de périmètre pour déterminer le statut initial :");
    await initial.run();

    logger.info({ type: "job" }, "∙ Application des règles de périmètre en tenant compte des actions :");
    await controller.run();

    logger.info({ type: "job" }, "∙ Vérification du périmètre :");
    await perimetre.run();

    logger.info({ type: "job" }, "∙ Vérification des dates de session :");
    await session.run();
    await previousSession.run();

    logger.info({ type: "job" }, "∙ Compteurs après :");
    await counter.run();

    logger.info({ type: "job" }, "∙ Differences :");
    await differences.run();

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
