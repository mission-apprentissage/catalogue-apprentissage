const { rebuildIndex } = require("../../common/utils/esUtils");
const { MnaFormation, RcoFormation, ConvertedFormation } = require("../../common/model/index");

const rebuildEsIndex = async (index) => {
  switch (index) {
    case "mnaformation":
      await rebuildIndex("mnaformation", MnaFormation);
      break;

    case "rcoformation":
      await rebuildIndex("rcoformation", RcoFormation);
      break;

    case "convertedformation":
      await rebuildIndex("convertedformation", ConvertedFormation);
      break;

    default:
      await rebuildIndex("mnaformation", MnaFormation);
      await rebuildIndex("rcoformation", RcoFormation);
      await rebuildIndex("convertedformation", ConvertedFormation);
  }
};

module.exports = { rebuildEsIndex };
