const { rebuildIndex } = require("../../common/utils/esUtils");
const { ConvertedFormation, MnaFormation, PsFormation2021 } = require("../../common/model/index");

const rebuildEsIndex = async (index, skipNotFound = false, filter = {}) => {
  switch (index) {
    case "convertedformation":
      await rebuildIndex("convertedformation", ConvertedFormation, { skipNotFound, filter });
      break;

    case "psformations2021":
      await rebuildIndex("psformations2021", PsFormation2021, { skipNotFound, filter });
      break;

    case "mnaformation":
      await rebuildIndex("mnaformation", MnaFormation, { skipNotFound, filter });
      break;

    default:
      await rebuildIndex("convertedformation", ConvertedFormation);
      await rebuildIndex("psformations2021", PsFormation2021);
      await rebuildIndex("mnaformation", MnaFormation);
  }
};

module.exports = { rebuildEsIndex };
