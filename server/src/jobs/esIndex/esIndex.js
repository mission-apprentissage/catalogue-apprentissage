const { rebuildIndex, deleteIndex } = require("../../common/utils/esUtils");
const { Formation, ParcoursupFormation, Etablissement } = require("../../common/model/index");

const rebuildEsIndex = async (index, skipNotFound = false, filter = {}) => {
  switch (index) {
    case "formation":
    case "formations":
      await rebuildIndex("formation", Formation, { skipNotFound, filter });
      break;

    case "parcoursupformation":
    case "parcoursupformations":
      await rebuildIndex("parcoursupformations", ParcoursupFormation, { skipNotFound, filter });
      break;

    case "etablissement":
    case "etablissements":
      await rebuildIndex("etablissements", Etablissement, { skipNotFound, filter });
      break;

    default:
      await rebuildIndex("formation", Formation, { skipNotFound: true, filter: { published: true } });
      await rebuildIndex("parcoursupformations", ParcoursupFormation, { skipNotFound: true });
      await rebuildIndex("etablissements", Etablissement, { skipNotFound: true, filter: { published: true } });
  }
};

module.exports = { rebuildEsIndex, deleteIndex };
