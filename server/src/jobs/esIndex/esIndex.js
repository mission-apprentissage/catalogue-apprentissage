const { rebuildIndex } = require("../../common/utils/esUtils");
const { ConvertedFormation, MnaFormation } = require("../../common/model/index");

const rebuildEsIndex = async (index, skipNotFound = false, filter = {}) => {
  switch (index) {
    case "convertedformation":
      await rebuildIndex("convertedformation", ConvertedFormation, { skipNotFound, filter });
      break;

    case "mnaformation":
      await rebuildIndex("mnaformation", MnaFormation, { skipNotFound, filter });
      break;

    default:
      await rebuildIndex("convertedformation", ConvertedFormation);
      await rebuildIndex("mnaformation", MnaFormation);
  }
};

module.exports = { rebuildEsIndex };
