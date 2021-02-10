const { rebuildIndex } = require("../../common/utils/esUtils");
const { ConvertedFormation, MnaFormation } = require("../../common/model/index");

const rebuildEsIndex = async (index, skipNotFound = false) => {
  switch (index) {
    case "convertedformation":
      await rebuildIndex("convertedformation", ConvertedFormation, { skipNotFound });
      break;

    case "mnaformation":
      await rebuildIndex("mnaformation", MnaFormation, { skipNotFound });
      break;

    default:
      await rebuildIndex("convertedformation", ConvertedFormation);
      await rebuildIndex("mnaformation", MnaFormation);
  }
};

module.exports = { rebuildEsIndex };
