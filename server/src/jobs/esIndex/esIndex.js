const { rebuildIndex, deleteIndex } = require("../../common/utils/esUtils");
const { Formation, Etablissement } = require("../../common/models/index");

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

    default:
      await rebuildIndex("formation", Formation, { skipFound, filter: { published: true, ...filter } });
      await rebuildIndex("etablissements", Etablissement, {
        skipFound,
        filter: { published: true, ...filter },
      });
      break;
  }
};

module.exports = { rebuildEsIndex, deleteIndex };
