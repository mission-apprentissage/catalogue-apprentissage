const { runScript } = require("../scriptWrapper");
const { mongoose } = require("../../common/mongodb");
const { initTcoModel, getCpInfo } = require("@mission-apprentissage/tco-service-node");

runScript(async () => {
  await initTcoModel(mongoose);
  console.log(await getCpInfo("92600"));
});
