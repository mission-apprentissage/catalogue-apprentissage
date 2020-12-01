const logger = require("../../common/logger");
const { rebuildEsIndex } = require("./esIndex");

const { runScript } = require("../scriptWrapper");

const esIndex = async () => {
  try {
    logger.info(" -- Start esIndex -- ");

    const args = process.argv.slice(2);
    await rebuildEsIndex(args?.[0]);

    logger.info(" -- End of esIndex -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = esIndex;

if (process.env.standalone) {
  runScript(async () => {
    await esIndex();
  });
}
