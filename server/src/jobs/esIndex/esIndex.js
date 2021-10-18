const { rebuildIndex } = require("../../common/utils/esUtils");
const { ConvertedFormation, PsFormation } = require("../../common/model/index");

const rebuildEsIndex = async (index, skipNotFound = false, filter = {}) => {
  switch (index) {
    case "convertedformation":
      await rebuildIndex("convertedformation", ConvertedFormation, { skipNotFound, filter });
      break;

    case "psformations":
      await rebuildIndex("psformations", PsFormation, { skipNotFound, filter });
      break;

    default:
      await rebuildIndex("convertedformation", ConvertedFormation);
      await rebuildIndex("psformations", PsFormation);
  }
};

module.exports = { rebuildEsIndex };
