const logger = require("../../../common/logger");
const controller = require("./controller");
const previousStatus = require("./previousStatus");
const checkUai = require("./checkUai");

const { runScript } = require("../../scriptWrapper");

const psStartCampagne = async () => {
  try {
    logger.info({ type: "job" }, " -- PARCOURSUP | START CAMPAGNE : ⏳  -- ");

    logger.info({ type: "job" }, "∙ Sauvegarde du statut en fin de campagne");
    await previousStatus.run();

    logger.info({ type: "job" }, "∙ Vérification de la validité de l'UAI");
    await checkUai.run();

    logger.info({ type: "job" }, "∙ Réinitialisation des statuts");
    await controller.run();

    logger.info({ type: "job" }, " -- PARCOURSUP | START CAMPAGNE : ✅  -- ");
  } catch (error) {
    logger.error({ type: "job" }, error);
    logger.error({ type: "job" }, " -- PARCOURSUP | START CAMPAGNE : ❌  -- ");
  }
};

module.exports = { psStartCampagne };

if (process.env.standalone) {
  runScript(async () => {
    // const args = process.argv.slice(2);

    await psStartCampagne({});
  });
}
