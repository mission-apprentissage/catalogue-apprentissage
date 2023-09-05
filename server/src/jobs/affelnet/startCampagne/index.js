const logger = require("../../../common/logger");
const controller = require("./controller");

const { runScript } = require("../../scriptWrapper");

/**
 *
 *
 * @param {{date: string, force: boolean}} config Un objet de configuration pour le job
 * @param {string} config.date Une date sous la forme 'YYYY-MM-DD'.
 * @param {string} config.force Un booléen pour force la réinitialisation du statut, même si la date ne le permet pas.
 */
const afStartCampagne = async () => {
  try {
    logger.info({ type: "job" }, " -- AFFELNET START CAMPAGNE : ⏳ -- ");

    await controller.run();

    logger.info({ type: "job" }, " -- AFFELNET START CAMPAGNE : ✅  -- ");
  } catch (error) {
    logger.error({ type: "job" }, error);
  }
};

module.exports = { afStartCampagne };

if (process.env.standalone) {
  runScript(async () => {
    // const args = process.argv.slice(2);

    await afStartCampagne({});
  });
}
