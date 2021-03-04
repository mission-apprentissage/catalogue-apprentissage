const { runScript } = require("../scriptWrapper");
const { mongoose } = require("../../common/mongodb");
const { init } = require("@mission-apprentissage/tco-service-node");

runScript(async () => {
  await init(mongoose);
  //console.log(await getCpInfo("92600"));
});
