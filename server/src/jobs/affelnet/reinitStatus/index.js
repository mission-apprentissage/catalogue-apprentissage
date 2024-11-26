const logger = require("../../../common/logger");
const controller = require("./controller");

const { runScript } = require("../../scriptWrapper");
const { isSameDate, getLastMonth } = require("../../../common/utils/dateUtils");

/**
 *
 *
 * @param {Object} config Un objet de configuration pour le job
 * @param {string} config.date Une date sous la forme 'YYYY-MM-DD'.
 * @param {boolean} config.force Un booléen pour force la réinitialisation du statut, même si la date ne le permet pas.
 */
const afReinitStatus = async (config) => {
  try {
    logger.info({ type: "job" }, " -- AFFELNET | STATUS REINITIALISATION : ⏳ -- ");

    let date;
    if (config?.date) {
      date = new Date(config.date);
      logger.info(
        { type: "job" },
        `La date ${date} a été passée en argument, les formations dont le statut est 'prêt pour intégration' depuis cette date vont voir celui-ci réinitialiser.`
      );
    } else {
      date = getLastMonth("09");

      if (!config?.force && !isSameDate(new Date(), date)) {
        logger.info(
          { type: "job" },
          "Aucune date n'a été passée en argument, les formations dont le statut est 'prêt pour intégration' ne peuvent être réinitialisées automatiquement que le 1er septembre. Passer l'argument --force pour forcer la réinitialisation."
        );
        return;
      } else {
        logger.info(
          { type: "job" },
          "Aucune date n'a été passée en argument. Etant le 1er septembre, les formations étant 'prêt pour intégration' sur Affelnet vont être réinitialisées."
        );
      }
    }

    console.log(date);

    await controller.run(date);

    logger.info({ type: "job" }, " -- AFFELNET | STATUS REINITIALISATION : ✅  -- ");
  } catch (error) {
    logger.error({ type: "job" }, error);
    logger.error({ type: "job" }, " -- AFFELNET | STATUS REINITIALISATION : ❌  -- ");
  }
};

module.exports = { afReinitStatus };

if (process.env.standalone) {
  runScript(async () => {
    const args = process.argv.slice(2);
    const date = args.find((arg) => arg.startsWith("--date"))?.split("=")?.[1];
    const force = args.includes("--force");
    await afReinitStatus({ date, force });
  });
}
