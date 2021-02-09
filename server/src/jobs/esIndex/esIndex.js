const { rebuildIndex } = require("../../common/utils/esUtils");
const { ConvertedFormation } = require("../../common/model/index");

const rebuildEsIndex = async (index, skipNotFound = false) => {
  switch (index) {
    case "convertedformations":
      await rebuildIndex("convertedformations", ConvertedFormation, { skipNotFound });
      break;

    default:
      await rebuildIndex("convertedformations", ConvertedFormation);
  }
};

module.exports = { rebuildEsIndex };
