const logger = require("../../../common/logger");
const controller = require("./controller");
const previousStatus = require("./previousStatus");
const checkUai = require("./checkUai");
const removeCandidatureItems = require("./removeCandidatureItems");

const { runScript } = require("../../scriptWrapper");

const afStartCampagne = async () => {
  try {
    logger.info({ type: "job" }, " -- AFFELNET | START CAMPAGNE : ⏳ -- ");

    logger.info({ type: "job" }, "∙ Sauvegarde du statut en fin de campagne");
    await previousStatus.run();

    logger.info({ type: "job" }, "∙ Vérification de la validité de l'UAI");
    await checkUai.run();

    logger.info({ type: "job" }, "∙ Suppression des tables importées depuis le site de transfert des candidaturesI");
    await removeCandidatureItems.run();

    logger.info({ type: "job" }, "∙ Réinitialisation des statuts");
    await controller.run();

    logger.info({ type: "job" }, " -- AFFELNET | START CAMPAGNE : ✅  -- ");
  } catch (error) {
    logger.error({ type: "job" }, error);
    logger.error({ type: "job" }, " -- AFFELNET | START CAMPAGNE : ❌  -- ");
  }
};

module.exports = { afStartCampagne };

if (process.env.standalone) {
  runScript(async () => {
    // const args = process.argv.slice(2);

    await afStartCampagne({});
  });
}
