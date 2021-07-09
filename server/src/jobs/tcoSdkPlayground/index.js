const { runScript } = require("../scriptWrapper");
const {
  // getCpInfo,
  // rncpImporter,
  // getRncpInfo,
  // bcnImporter,
  getCfdInfo,
  // getMef10Info,
  // getSiretInfo,
  // getBcnInfo,
  getCoordinatesFromAddressData,
  getNiveauxDiplomesTree,
  getAddressFromCoordinates,
} = require("@mission-apprentissage/tco-service-node");

// const KIT_LOCAL_PATH = "/data/uploads/CodeDiplome_RNCP_latest_kit.csv";

runScript(async () => {
  // console.log(await getCpInfo("92600"));

  // await rncpImporter(KIT_LOCAL_PATH);
  // console.log(await getRncpInfo("RNCP7571"));

  //await bcnImporter();
  // console.log(await getCfdInfo("26033206"));

  const cfdInfo = await getCfdInfo("40033002");
  console.log(new Date(cfdInfo.result.date_fermeture)); // --> 2022-08-30T22:00:00.000Z

  // console.log(await getMef10Info("23310022319"));

  // console.log(await getSiretInfo("32922456200234"));

  // console.log(await getBcnInfo({ query: { LIBELLE_STAT_33: "CARROSSERIE", LIBELLE_COURT: "BEP" } }));

  console.log(
    await getCoordinatesFromAddressData({
      numero_voie: "8 rue de l'Artisanat",
      localite: "Charleville-Mézières",
      code_postal: "08000",
    })
  );

  const tree = await getNiveauxDiplomesTree();
  console.log(tree);

  console.log(
    await getAddressFromCoordinates({
      latitude: 45.2344404,
      longitude: 5.67547279999997,
    })
  );
});
