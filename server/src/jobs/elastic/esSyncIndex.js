const { rebuildIndex } = require("../../common/utils/esUtils");
const { Formation, Etablissement, User } = require("../../common/models/index");
const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");

const esSyncIndex = async (index, skipFound = false, filter = {}) => {
  switch (index) {
    case "formation":
    case "formations":
      await rebuildIndex(Formation, {
        skipFound,
        filter: {
          published: true,
          ...filter,
        },
      });
      break;

    case "etablissement":
    case "etablissements":
      await rebuildIndex(Etablissement, { skipFound, filter: { published: true, ...filter } });
      break;

    case "user":
    case "users":
      await rebuildIndex(User, { skipFound, filter: { ...filter } });
      break;

    case "all":
      await rebuildIndex(User, { skipFound, filter: { ...filter } });
      await rebuildIndex(Formation, { skipFound, filter: { published: true, ...filter } });
      await rebuildIndex(Etablissement, {
        skipFound,
        filter: { published: true, ...filter },
      });
      break;

    default:
      throw Error(
        "Il est nécessaire de passer l'index à recréer. Si vous souhaitez recréer tous les indexes, passez 'all'"
      );
  }
};

module.exports = { esSyncIndex };

if (process.env.standalone) {
  runScript(
    async () => {
      try {
        logger.info({ type: "job" }, `ES SYNC INDEX ⏳`);

        const args = process.argv.slice(2);
        const shouldSkipFound = args?.includes("--skipFound");
        await esSyncIndex(args?.[0], shouldSkipFound);

        logger.info({ type: "job" }, `ES SYNC INDEX ✅`);
      } catch (error) {
        logger.error({ type: "job" }, error);
        logger.error({ type: "job" }, `ES SYNC INDEX ❌`);
      }
    },
    { alert: true }
  );
}
