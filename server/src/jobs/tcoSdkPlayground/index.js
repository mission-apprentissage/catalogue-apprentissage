const { runScript } = require("../scriptWrapper");
const { mongoose } = require("../../common/mongodb");

const {
  initTcoModel,
  // getCpInfo,
  rncpImporter,
  getRncpInfo,
  // bcnImporter,
  // getCfdInfo,
  // getMef10Info,
  // getSiretInfo,
} = require("@mission-apprentissage/tco-service-node");

runScript(async () => {
  await initTcoModel(mongoose);
  // console.log(await getCpInfo("92600"));

  await rncpImporter();
  console.log(await getRncpInfo("RNCP7571"));

  //await bcnImporter();
  //console.log(await getCfdInfo("26033206"));
  // console.log(await getMef10Info("23310022319"));

  // console.log(await getSiretInfo("32922456200234"));
});
