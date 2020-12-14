const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");
const opcoImporter = require("./importer/importer");

const opcoImport = async () => {
  try {
    logger.info(" -- Start of OPCO importer -- ");

    await opcoImporter();

    logger.info(" -- End of OPCO importer -- ");
  } catch (err) {
    logger.error(err);
  }
};

runScript(async () => {
  await opcoImport();
});
