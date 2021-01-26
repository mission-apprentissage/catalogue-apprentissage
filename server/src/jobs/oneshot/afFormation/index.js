const { seed, update_oleoduc } = require("./importer");
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { AfFormation } = require("../../../common/model");

if (process.env.standalone) {
  runScript(async ({ tableCorrespondance }) => {
    logger.info(`Start affelnet import`);

    if ((await AfFormation.countDocuments({})) == 0) {
      logger.info("Import des données en base");
      await seed();
    }
    logger.info("Mise à jour des codes formation diplôme");
    await update_oleoduc(tableCorrespondance);

    logger.info(`End affelnet import`);
  });
}
