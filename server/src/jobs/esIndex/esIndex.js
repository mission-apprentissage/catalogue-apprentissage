const { rebuildIndex } = require("../../common/utils/esUtils");
const { MnaFormation, RcoFormation, ConvertedFormation } = require("../../common/model/index");

const rebuildEsIndex = async (index, skipNotFound = false) => {
  switch (index) {
    case "mnaformation":
      await rebuildIndex("mnaformation", MnaFormation, { skipNotFound });
      break;

    case "rcoformation":
      await rebuildIndex("rcoformation", RcoFormation, { skipNotFound });
      break;

    case "convertedformation":
      await rebuildIndex("convertedformation", ConvertedFormation, { skipNotFound });
      break;

    default:
      await rebuildIndex("mnaformation", MnaFormation);
      await rebuildIndex("rcoformation", RcoFormation);
      await rebuildIndex("convertedformation", ConvertedFormation);
  }
};

module.exports = { rebuildEsIndex };
