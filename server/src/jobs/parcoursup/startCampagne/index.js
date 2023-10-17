const logger = require("../../../common/logger");
const controller = require("./controller");
const previousStatus = require("./previousStatus");

const { runScript } = require("../../scriptWrapper");

/**
 *
 *
 * @param {{date: string, force: boolean}} config Un objet de configuration pour le job
 * @param {string} config.date Une date sous la forme 'YYYY-MM-DD'.
 * @param {string} config.force Un booléen pour force la réinitialisation du statut, même si la date ne le permet pas.
 */
const psStartCampagne = async () => {
  try {
    logger.info({ type: "job" }, " -- PARCOURSUP START CAMPAGNE : ⏳  -- ");

    logger.info({ type: "job" }, "Sauvegarde du statut en fin de campagne  -- ");
    await previousStatus.run();

    logger.info({ type: "job" }, "Réinitialisation des statuts  -- ");
    await controller.run();

    logger.info({ type: "job" }, " -- PARCOURSUP START CAMPAGNE : ✅  -- ");
  } catch (error) {
    logger.error({ type: "job" }, error);
    logger.error({ type: "job" }, " -- PARCOURSUP START CAMPAGNE : ❌  -- ");
  }
};

module.exports = { psStartCampagne };

if (process.env.standalone) {
  runScript(async () => {
    // const args = process.argv.slice(2);

    await psStartCampagne({});
  });
}
