const logger = require("../../common/logger");
const { rebuildEsIndex, deleteIndex } = require("./esIndex");

const { runScript } = require("../scriptWrapper");

const esIndex = async () => {
  try {
    logger.info(" -- Start esIndex -- ");

    const args = process.argv.slice(2);
    const shouldSkipFound = args?.includes("--skipFound");
    const shouldDelete = args.includes("--delete");

    if (shouldDelete) {
      await deleteIndex(args?.[0]);
    } else {
      await rebuildEsIndex(args?.[0], shouldSkipFound);
    }

    logger.info(" -- End of esIndex -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = esIndex;

if (process.env.standalone) {
  runScript(
    async () => {
      await esIndex();
    },
    { alert: true }
  );
}
