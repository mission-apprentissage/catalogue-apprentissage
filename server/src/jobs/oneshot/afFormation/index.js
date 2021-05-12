const { seed, update_oleoduc } = require("./importer");
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");

if (process.env.standalone) {
  runScript(async () => {
    logger.info(`Start affelnet import`);

    logger.info("Import des données en base");
    await seed();

    logger.info("Mise à jour des codes formation diplôme");
    await update_oleoduc();

    logger.info(`End affelnet import`);
  });
}
