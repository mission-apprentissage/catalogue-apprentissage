const { rebuildIndex, deleteIndex } = require("../../common/utils/esUtils");
const { Formation, PsFormation, Etablissement } = require("../../common/model/index");

const rebuildEsIndex = async (index, skipNotFound = false, filter = {}) => {
  switch (index) {
    case "formation":
      await rebuildIndex("formation", Formation, { skipNotFound, filter });
      break;

    case "psformations":
      await rebuildIndex("psformations", PsFormation, { skipNotFound, filter });
      break;

    case "etablissements":
      await rebuildIndex("etablissements", Etablissement, { skipNotFound, filter });
      break;

    default:
      await rebuildIndex("formation", Formation, { skipNotFound: true, filter: { published: true } });
      await rebuildIndex("psformations", PsFormation, { skipNotFound: true });
      await rebuildIndex("etablissements", Etablissement, { skipNotFound: true });
  }
};

module.exports = { rebuildEsIndex, deleteIndex };
