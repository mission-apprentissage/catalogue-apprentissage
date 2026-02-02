const { deleteIndex } = require("../../common/utils/esUtils");
const { Formation, Etablissement, User } = require("../../common/models/index");
const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");

const esDeleteIndex = async (index) => {
  switch (index) {
    case "formation":
    case "formations":
      await deleteIndex(Formation);
      break;

    case "etablissement":
    case "etablissements":
      await deleteIndex(Etablissement);
      break;

    case "user":
    case "users":
      await deleteIndex(User);
      break;

    case "all":
      await deleteIndex(User);
      await deleteIndex(Formation);
      await deleteIndex(Etablissement);

      break;

    default:
      throw Error(
        "Il est nécessaire de passer l'index à supprimer. Si vous souhaitez supprimer tous les indexes, passez 'all'"
      );
  }
};

module.exports = { esDeleteIndex };

if (process.env.standalone) {
  runScript(
    async () => {
      try {
        logger.info({ type: "job" }, `ES DELETE INDEX ⏳`);

        const args = process.argv.slice(2);
        await esDeleteIndex(args?.[0]);

        logger.info({ type: "job" }, `ES DELETE INDEX ✅`);
      } catch (error) {
        logger.error({ type: "job" }, error);
        logger.error({ type: "job" }, `ES DELETE INDEX ❌`);
      }
    },
    { alert: true }
  );
}
