const assert = require("assert");

// mock TCO
const rewiremock = require("rewiremock/node");
const { mock } = require("@mission-apprentissage/tco-service-node");
rewiremock("@mission-apprentissage/tco-service-node").with(mock);

describe(__filename, () => {
  beforeEach(() => rewiremock.enable());
  afterEach(() => rewiremock.disable());

  it("should have mocked tco", async () => {
    const {
      initTcoModel,
      rncpImporter,
      bcnImporter,
      onisepImporter,
      getCfdInfo,
      isValideUAI,
      getCpInfo,
      getRncpInfo,
      getMef10Info,
      getSiretInfo,
      getBcnInfo,
      getCoordinatesFromAddressData,
      getAddressFromCoordinates,
      getNiveauxDiplomesTree,
    } = require("@mission-apprentissage/tco-service-node");

    // dummy calls to init functions to show it is properly mocked
    await initTcoModel(null, null);
    await rncpImporter();
    await bcnImporter();
    await onisepImporter(null);

    // call with any argument will get the stub result
    const { result: cfdData } = await getCfdInfo("anything");

    assert.strictEqual(cfdData.cfd, "40033002");
    assert.strictEqual(cfdData.libelle_court, "BAC PRO");

    const notValidUai = await isValideUAI("99");
    assert.strictEqual(notValidUai, false);

    const validUai = await isValideUAI("0211531A");
    assert.strictEqual(validUai, true);

    const cpInfo = await getCpInfo("anything");
    assert.strictEqual(cpInfo.result.code_commune_insee, "92004");

    const rncpInfo = await getRncpInfo("whatever");
    assert.strictEqual(rncpInfo.result.code_rncp, "RNCP34605");
    assert.strictEqual(rncpInfo.result.code_type_certif, "BAC PRO");
    assert.strictEqual(rncpInfo.result.active_inactive, "ACTIVE");

    const mefInfo = await getMef10Info("anything");
    assert.strictEqual(mefInfo.result.cfd.cfd, "50022319");

    const siretInfo = await getSiretInfo("some-siret");
    assert.strictEqual(siretInfo.result.entreprise_siren, "329224562");

    const bcnInfo = await getBcnInfo({});
    assert.strictEqual(bcnInfo.formationsDiplomes[0].LIBELLE_STAT_33, "CARROSSERIE");

    const coordinates = await getCoordinatesFromAddressData({});
    assert.deepStrictEqual(coordinates.result, {
      geo_coordonnees: "49.743252,4.730734",
      results_count: 1,
    });

    const address = await getAddressFromCoordinates({});
    assert.strictEqual(address.result.adresse.commune, "Blagnac");

    const tree = await getNiveauxDiplomesTree({});
    assert.ok(tree["4 (BAC...)"].includes("BAC GENERAL"));
  });
});
