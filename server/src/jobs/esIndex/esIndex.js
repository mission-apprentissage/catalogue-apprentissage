const { rebuildIndex } = require("../../common/utils/esUtils");
const { Formation, PsFormation } = require("../../common/model/index");

const rebuildEsIndex = async (index, skipNotFound = false, filter = {}) => {
  switch (index) {
    case "formation":
      await rebuildIndex("formation", Formation, { skipNotFound, filter });
      break;

    case "psformations":
      await rebuildIndex("psformations", PsFormation, { skipNotFound, filter });
      break;

    default:
      await rebuildIndex("formation", Formation);
      await rebuildIndex("psformations", PsFormation);
  }
};

module.exports = { rebuildEsIndex };
