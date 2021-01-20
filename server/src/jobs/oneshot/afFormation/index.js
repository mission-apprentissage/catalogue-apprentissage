const { seed, update } = require("./importer");
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { AfFormation } = require("../../../common/model");

if (process.env.standalone) {
  runScript(async ({ tableCorrespondance }) => {
    logger.info(`Start affelnet import`);

    if ((await AfFormation.countDocuments({})) == 0) {
      await seed();
    }
    await update(tableCorrespondance);

    logger.info(`End affelnet import`);
  });
}
