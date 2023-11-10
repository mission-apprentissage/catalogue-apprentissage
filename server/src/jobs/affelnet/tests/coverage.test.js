const assert = require("assert");
const { AffelnetFormation, Formation } = require("../../../common/model/index");
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");
const { afCoverage } = require("../coverage");
const { AFFELNET_STATUS } = require("../../../constants/status");

describe(__filename, () => {
  before(async () => {
    // Connection to test collection
    await connectToMongoForTests();
    await Formation.deleteMany({});
    await AffelnetFormation.deleteMany({});

    // formations
    await Formation.create({
      published: true,
      etablissement_reference_catalogue_published: true,
      affelnet_statut: AFFELNET_STATUS.NON_INTEGRABLE,
      cle_ministere_educatif: "cle_1",
      intitule_court: "formation 1",
      affelnet_perimetre: true,
    });

    await Formation.create({
      published: true,
      etablissement_reference_catalogue_published: true,
      affelnet_statut: AFFELNET_STATUS.NON_INTEGRABLE,
      cle_ministere_educatif: "cle_2",
      intitule_court: "formation 2",
      bcn_mefs_10: [{ mef10: "4444444444" }],
      niveau: "3 (CAP...)",
      num_departement: "93",
      code_postal: "93100",
      etablissement_gestionnaire_uai: "uai_4",
      affelnet_perimetre: true,
    });

    await Formation.create({
      published: true,
      etablissement_reference_catalogue_published: true,
      affelnet_statut: AFFELNET_STATUS.NON_INTEGRABLE,
      cle_ministere_educatif: "cle_3",
      intitule_court: "formation 3",
      affelnet_perimetre: true,
    });

    // formations affelnet
    await AffelnetFormation.create({
      cle_ministere_educatif: "cle_1",
      uai: "uai_1",
      code_mef: "1111111111",
      code_postal: "75008",
    });

    await AffelnetFormation.create({
      cle_ministere_educatif: "cle_2222",
      uai: "uai_2",
      code_mef: "2222222222",
      code_postal: "75008",
    });

    await AffelnetFormation.create({
      uai: "uai_3",
      code_mef: "3333333333",
      code_postal: "75008",
    });
  });

  after(async () => {
    await cleanAll();
  });

  it("should have inserted sample data", async () => {
    const countFormations = await Formation.countDocuments({});
    assert.strictEqual(countFormations, 3);

    const countAfFormations = await AffelnetFormation.countDocuments({});
    assert.strictEqual(countAfFormations, 3);
  });

  it("should apply published status when has the same cle_ministere_educatif", async () => {
    const totalPublishedBeforeRun = await Formation.countDocuments({
      affelnet_statut: AFFELNET_STATUS.PUBLIE,
    });
    assert.strictEqual(totalPublishedBeforeRun, 0);

    await afCoverage({});

    const totalPublished = await Formation.countDocuments({
      affelnet_statut: AFFELNET_STATUS.PUBLIE,
    });
    assert.strictEqual(totalPublished, 1);

    const found = await Formation.findOne({
      affelnet_statut: AFFELNET_STATUS.PUBLIE,
    });
    assert.strictEqual(found.cle_ministere_educatif, "cle_1");

    const affelnetFormation = await AffelnetFormation.findOne({ cle_ministere_educatif: "cle_1" });
    assert.strictEqual(affelnetFormation.matching_type, "100");
    assert.strictEqual(affelnetFormation.matching_mna_formation.length, 1);
    assert.strictEqual(affelnetFormation.matching_mna_formation[0].cle_ministere_educatif, "cle_1");
  });

  it("should apply published status when find one match force 5", async () => {
    await AffelnetFormation.deleteOne({ cle_ministere_educatif: "cle_1" });

    await AffelnetFormation.create({
      cle_ministere_educatif: "cle_4444",
      uai: "uai_4",
      code_mef: "4444444444",
      code_postal: "93100",
    });

    await afCoverage({});

    const totalPublished = await Formation.countDocuments({
      affelnet_statut: AFFELNET_STATUS.PUBLIE,
    });
    assert.strictEqual(totalPublished, 1);

    const found = await Formation.findOne({
      affelnet_statut: AFFELNET_STATUS.PUBLIE,
    });
    assert.strictEqual(found.cle_ministere_educatif, "cle_2");

    const affelnetFormation = await AffelnetFormation.findOne({ cle_ministere_educatif: "cle_4444" });
    assert.strictEqual(affelnetFormation.matching_type, "5");
    assert.strictEqual(affelnetFormation.matching_mna_formation.length, 1);
    assert.strictEqual(affelnetFormation.matching_mna_formation[0].cle_ministere_educatif, "cle_2");
  });

  it("should apply published status when find one match force 4", async () => {
    await AffelnetFormation.deleteOne({ cle_ministere_educatif: "cle_4444" });

    await AffelnetFormation.create({
      cle_ministere_educatif: "cle_4444",
      uai: "uai_4",
      code_mef: "4444444444",
      code_postal: "93700",
    });

    await afCoverage({});

    const totalPublished = await Formation.countDocuments({
      affelnet_statut: AFFELNET_STATUS.PUBLIE,
    });
    assert.strictEqual(totalPublished, 1);

    const found = await Formation.findOne({
      affelnet_statut: AFFELNET_STATUS.PUBLIE,
    });
    assert.strictEqual(found.cle_ministere_educatif, "cle_2");

    const affelnetFormation = await AffelnetFormation.findOne({ cle_ministere_educatif: "cle_4444" });
    assert.strictEqual(affelnetFormation.matching_type, "4");
    assert.strictEqual(affelnetFormation.matching_mna_formation.length, 1);
    assert.strictEqual(affelnetFormation.matching_mna_formation[0].cle_ministere_educatif, "cle_2");
  });

  it("should apply published status when find one match force 3", async () => {
    await AffelnetFormation.deleteOne({ cle_ministere_educatif: "cle_4444" });

    await AffelnetFormation.create({
      cle_ministere_educatif: "cle_4444",
      uai: "uai_nope",
      code_mef: "4444444444",
      code_postal: "93100",
    });

    await afCoverage({});

    const totalPublished = await Formation.countDocuments({
      affelnet_statut: AFFELNET_STATUS.PUBLIE,
    });
    assert.strictEqual(totalPublished, 1);

    const found = await Formation.findOne({
      affelnet_statut: AFFELNET_STATUS.PUBLIE,
    });
    assert.strictEqual(found.cle_ministere_educatif, "cle_2");

    const affelnetFormation = await AffelnetFormation.findOne({ cle_ministere_educatif: "cle_4444" });
    assert.strictEqual(affelnetFormation.matching_type, "3");
    assert.strictEqual(affelnetFormation.matching_mna_formation.length, 1);
    assert.strictEqual(affelnetFormation.matching_mna_formation[0].cle_ministere_educatif, "cle_2");
  });

  it("should apply published status when find one match force 3bis", async () => {
    await AffelnetFormation.deleteOne({ cle_ministere_educatif: "cle_4444" });

    await AffelnetFormation.create({
      cle_ministere_educatif: "cle_4444",
      uai: "uai_4",
      code_mef: "4444444444",
      code_postal: "75008",
    });

    await afCoverage({});

    const totalPublished = await Formation.countDocuments({
      affelnet_statut: AFFELNET_STATUS.PUBLIE,
    });
    assert.strictEqual(totalPublished, 1);

    const found = await Formation.findOne({
      affelnet_statut: AFFELNET_STATUS.PUBLIE,
    });
    assert.strictEqual(found.cle_ministere_educatif, "cle_2");

    const affelnetFormation = await AffelnetFormation.findOne({ cle_ministere_educatif: "cle_4444" });
    assert.strictEqual(affelnetFormation.matching_type, "3");
    assert.strictEqual(affelnetFormation.matching_mna_formation.length, 1);
    assert.strictEqual(affelnetFormation.matching_mna_formation[0].cle_ministere_educatif, "cle_2");
  });

  it("should not apply published status when find one match force 2", async () => {
    await AffelnetFormation.deleteOne({ cle_ministere_educatif: "cle_4444" });

    await AffelnetFormation.create({
      cle_ministere_educatif: "cle_4444",
      uai: "uai_nope",
      code_mef: "4444444444",
      code_postal: "93700",
    });

    await afCoverage({});

    const totalPublished = await Formation.countDocuments({
      affelnet_statut: AFFELNET_STATUS.PUBLIE,
    });
    assert.strictEqual(totalPublished, 0);

    const affelnetFormation = await AffelnetFormation.findOne({ cle_ministere_educatif: "cle_4444" });
    assert.strictEqual(affelnetFormation.matching_type, "2");
    assert.strictEqual(affelnetFormation.matching_mna_formation.length, 1);
    assert.strictEqual(affelnetFormation.matching_mna_formation[0].cle_ministere_educatif, "cle_2");
  });

  it("should not apply published status when find one match force 1", async () => {
    await AffelnetFormation.deleteOne({ cle_ministere_educatif: "cle_4444" });

    await AffelnetFormation.create({
      cle_ministere_educatif: "cle_4444",
      uai: "uai_nope",
      code_mef: "4444444444",
      code_postal: "75008",
    });

    await afCoverage({});

    const totalPublished = await Formation.countDocuments({
      affelnet_statut: AFFELNET_STATUS.PUBLIE,
    });
    assert.strictEqual(totalPublished, 0);

    const affelnetFormation = await AffelnetFormation.findOne({ cle_ministere_educatif: "cle_4444" });
    assert.strictEqual(affelnetFormation.matching_type, "1");
    assert.strictEqual(affelnetFormation.matching_mna_formation.length, 1);
    assert.strictEqual(affelnetFormation.matching_mna_formation[0].cle_ministere_educatif, "cle_2");
  });
});
