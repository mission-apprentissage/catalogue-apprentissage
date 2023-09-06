const logger = require("../../common/logger");
const { rebuildEsIndex, deleteIndex } = require("./esIndex");

const { runScript } = require("../scriptWrapper");

const esIndex = async () => {
  try {
    logger.info({ type: "job" }, `ES INDEX ⏳`);

    const args = process.argv.slice(2);
    const shouldSkipFound = args?.includes("--skipFound");
    const shouldDelete = args.includes("--delete");

    if (shouldDelete) {
      await deleteIndex(args?.[0]);
    } else {
      await rebuildEsIndex(args?.[0], shouldSkipFound);
    }

    logger.info({ type: "job" }, `ES INDEX ✅`);
  } catch (error) {
    logger.error({ type: "job" }, error);
    logger.error({ type: "job" }, `ES INDEX ❌`);
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
