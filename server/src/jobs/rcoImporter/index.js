const logger = require("../../common/logger");
const importer = require("./importer/importer");
const { runScript } = require("../scriptWrapper");

const rcoImporter = async () => {
  try {
    logger.info(" -- Start of RCO importer -- ");

    await importer.run();

    logger.info(" -- End of RCO importer -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = rcoImporter;

if (process.env.standalone) {
  runScript(async () => {
    await rcoImporter();
  });
}
