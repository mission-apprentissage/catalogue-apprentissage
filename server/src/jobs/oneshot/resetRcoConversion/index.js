const { RcoFormation, ConvertedFormation } = require("../../../common/model/index");
const { runScript } = require("../../scriptWrapper");

const run = async () => {
  await ConvertedFormation.deleteMany({});
  await RcoFormation.updateMany({}, { $set: { conversion_error: null, converted_to_mna: false } });
};

runScript(async () => {
  await run();
});
