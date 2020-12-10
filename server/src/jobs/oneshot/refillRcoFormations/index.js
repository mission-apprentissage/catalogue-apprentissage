const { runScript } = require("../../scriptWrapper");
const logger = require("../../../common/logger");
const importer = require("../../rcoImporter/importer/importer");
const wsRCO = require("../../rcoImporter/importer/wsRCO");

const run = async () => {
  try {
    logger.info(" -- Start refill rco formations -- ");

    const formationsJ1 = [];
    const formations = await wsRCO.getRCOcatalogue();
    await importer.start(formations, formationsJ1);

    logger.info(" -- End of refill rco formations -- ");
  } catch (err) {
    logger.error(err);
  }
};

runScript(async () => {
  await run();
});
