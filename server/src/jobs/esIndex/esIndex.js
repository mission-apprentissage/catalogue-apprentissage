const { rebuildIndex, deleteIndex } = require("../../common/utils/esUtils");
const { Formation, Etablissement, User } = require("../../common/models/index");

const rebuildEsIndex = async (index, skipFound = false, filter = {}) => {
  switch (index) {
    case "formation":
    case "formations":
      await rebuildIndex("formation", Formation, {
        skipFound,
        filter: {
          published: true,
          ...filter,
        },
      });
      break;

    case "etablissement":
    case "etablissements":
      await rebuildIndex("etablissements", Etablissement, { skipFound, filter: { published: true, ...filter } });
      break;

    case "user":
    case "users":
      await rebuildIndex("users", User, { skipFound, filter: { ...filter } });
      break;

    case "all":
      await rebuildIndex("users", User, { skipFound, filter: { ...filter } });
      await rebuildIndex("formations", Formation, { skipFound, filter: { published: true, ...filter } });
      await rebuildIndex("etablissements", Etablissement, {
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

module.exports = { rebuildEsIndex, deleteIndex };
