const { runScript } = require("../scriptWrapper");
const {
  // getCpInfo,
  rncpImporter,
  getRncpInfo,
  // bcnImporter,
  // getCfdInfo,
  // getMef10Info,
  // getSiretInfo,
  // getBcnInfo,
} = require("@mission-apprentissage/tco-service-node");

const path = require("path");

const KIT_LOCAL_PATH = path.join(__dirname, "KitApprentissage.latest.xlsx");

runScript(async () => {
  // console.log(await getCpInfo("92600"));

  await rncpImporter(KIT_LOCAL_PATH);
  console.log(await getRncpInfo("RNCP7571"));

  //await bcnImporter();
  //console.log(await getCfdInfo("26033206"));
  // console.log(await getMef10Info("23310022319"));

  // console.log(await getSiretInfo("32922456200234"));

  // console.log(await getBcnInfo({ query: { LIBELLE_STAT_33: "CARROSSERIE", LIBELLE_COURT: "BEP" } }));
});
