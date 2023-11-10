const assert = require("assert");
const { ParcoursupFormation, Formation } = require("../../../common/model/index");
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");
const { psCoverage } = require("../coverage");
const { PARCOURSUP_STATUS } = require("../../../constants/status");
const { setupBefore, setupAfter } = require("../../../../tests/helpers/setup");

describe(__filename, () => {
  before(async () => {
    setupBefore();
    // Connection to test collection
    await connectToMongoForTests();
    await Formation.deleteMany({});
    await ParcoursupFormation.deleteMany({});

    // formations
    await Formation.create({
      published: true,
      etablissement_reference_catalogue_published: true,
      affelnet_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
      cle_ministere_educatif: "cle_1",
      intitule_court: "formation 1",
      cfd_entree: "111111",
      code_commune_insee: "93048",
      code_postal: "93100",
      etablissement_gestionnaire_uai: "uai_1",
      etablissement_formateur_uai: "uai_1",
      etablissement_formateur_siret: "siret_1",
      rncp_code: "RNCP0001",
      nom_academie: "Montpellier",
    });

    await Formation.create({
      published: true,
      etablissement_reference_catalogue_published: true,
      affelnet_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
      cle_ministere_educatif: "cle_2",
      intitule_court: "formation 2",
      bcn_mefs_10: [{ mef10: "4444444444" }],
      niveau: "3 (CAP...)",
      num_departement: "93",
      code_postal: "93100",
      etablissement_gestionnaire_uai: "uai_4",
    });

    await Formation.create({
      published: true,
      etablissement_reference_catalogue_published: true,
      affelnet_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
      cle_ministere_educatif: "cle_3",
      intitule_court: "formation 3",
    });

    // formations affelnet
    await ParcoursupFormation.create({
      cle_ministere_educatif: "cle_1",
      uai: "uai_1",
      code_mef: "1111111111",
      code_postal: "75008",
    });

    await ParcoursupFormation.create({
      cle_ministere_educatif: "cle_2222",
      uai: "uai_2",
      code_mef: "2222222222",
      code_postal: "75008",
    });

    await ParcoursupFormation.create({
      uai: "uai_3",
      code_mef: "3333333333",
      code_postal: "75008",
    });
  });

  after(async () => {
    setupAfter();
    await cleanAll();
  });

  it("should have inserted sample data", async () => {
    const countFormations = await Formation.countDocuments({});
    assert.strictEqual(countFormations, 3);

    const countPsFormations = await ParcoursupFormation.countDocuments({});
    assert.strictEqual(countPsFormations, 3);
  });

  it("should not match", async () => {
    await psCoverage();

    const noMatchCount = await ParcoursupFormation.countDocuments({
      matching_mna_formation: { $size: 0 },
    });
    assert.strictEqual(noMatchCount, 3);
  });

  it("should match force 1", async () => {
    await ParcoursupFormation.create({
      codes_cfd_mna: ["111111"],
      code_commune_insee: "93048",
      id_parcoursup: "g_ta_1",
    });

    await psCoverage();

    const psFormation = await ParcoursupFormation.findOne({ id_parcoursup: "g_ta_1" });
    assert.strictEqual(psFormation.matching_type, "1");
    assert.strictEqual(psFormation.matching_mna_formation.length, 1);
    assert.strictEqual(psFormation.matching_mna_formation[0].cle_ministere_educatif, "cle_1");
  });

  it("should  match force 2", async () => {
    await ParcoursupFormation.deleteOne({ id_parcoursup: "g_ta_1" });

    await ParcoursupFormation.create({
      codes_cfd_mna: ["111111"],
      id_parcoursup: "g_ta_1",
      siret_cerfa: "siret_1",
    });

    await psCoverage();

    const psFormation = await ParcoursupFormation.findOne({ id_parcoursup: "g_ta_1" });
    assert.strictEqual(psFormation.matching_type, "2");
    assert.strictEqual(psFormation.matching_mna_formation.length, 1);
    assert.strictEqual(psFormation.matching_mna_formation[0].cle_ministere_educatif, "cle_1");
  });

  it("should match force 3", async () => {
    await ParcoursupFormation.deleteOne({ id_parcoursup: "g_ta_1" });

    await ParcoursupFormation.create({
      codes_cfd_mna: ["111111"],
      id_parcoursup: "g_ta_1",
      code_commune_insee: "93048",
      uai_gestionnaire: "uai_1",
    });

    await psCoverage();

    const psFormation = await ParcoursupFormation.findOne({ id_parcoursup: "g_ta_1" });
    assert.strictEqual(psFormation.matching_type, "3");
    assert.strictEqual(psFormation.matching_mna_formation.length, 1);
    assert.strictEqual(psFormation.matching_mna_formation[0].cle_ministere_educatif, "cle_1");
  });

  it("should match force 5", async () => {
    await ParcoursupFormation.deleteOne({ id_parcoursup: "g_ta_1" });

    await ParcoursupFormation.create({
      codes_cfd_mna: ["111111"],
      id_parcoursup: "g_ta_1",
      code_commune_insee: "93048",
      code_postal: "93100",
    });

    await psCoverage();

    const psFormation = await ParcoursupFormation.findOne({ id_parcoursup: "g_ta_1" });
    assert.strictEqual(psFormation.matching_type, "5");
    assert.strictEqual(psFormation.matching_mna_formation.length, 1);
    assert.strictEqual(psFormation.matching_mna_formation[0].cle_ministere_educatif, "cle_1");
  });

  it("should match force 6", async () => {
    await ParcoursupFormation.deleteOne({ id_parcoursup: "g_ta_1" });

    await ParcoursupFormation.create({
      codes_cfd_mna: ["111111"],
      codes_rncp_mna: ["rncp_1"],
      id_parcoursup: "g_ta_1",
      code_commune_insee: "93048",
      code_postal: "93100",
      uai_gestionnaire: "uai_1",
      nom_academie: "Montpellier",
    });

    await psCoverage();

    const psFormation = await ParcoursupFormation.findOne({ id_parcoursup: "g_ta_1" });
    assert.strictEqual(psFormation.matching_type, "6");
    assert.strictEqual(psFormation.matching_mna_formation.length, 1);
    assert.strictEqual(psFormation.matching_mna_formation[0].cle_ministere_educatif, "cle_1");
  });

  it("should match force 7", async () => {
    await ParcoursupFormation.deleteOne({ id_parcoursup: "g_ta_1" });

    await ParcoursupFormation.create({
      codes_cfd_mna: ["111111"],
      id_parcoursup: "g_ta_1",
      code_commune_insee: "93048",
      code_postal: "93100",
      uai_gestionnaire: "uai_1",
      nom_academie: "Montpellier",
      siret_cerfa: "siret_1",
    });

    await psCoverage();

    const psFormation = await ParcoursupFormation.findOne({ id_parcoursup: "g_ta_1" });
    assert.strictEqual(psFormation.matching_type, "7");
    assert.strictEqual(psFormation.matching_mna_formation.length, 1);
    assert.strictEqual(psFormation.matching_mna_formation[0].cle_ministere_educatif, "cle_1");
  });

  it("should match force 8", async () => {
    await ParcoursupFormation.deleteOne({ id_parcoursup: "g_ta_1" });

    await ParcoursupFormation.create({
      codes_cfd_mna: ["111111"],
      codes_rncp_mna: ["RNCP0001"],
      id_parcoursup: "g_ta_1",
      code_commune_insee: "93048",
      code_postal: "93100",
      uai_gestionnaire: "uai_1",
      nom_academie: "Montpellier",
      siret_cerfa: "siret_1",
    });

    await psCoverage();

    const psFormation = await ParcoursupFormation.findOne({ id_parcoursup: "g_ta_1" });
    assert.strictEqual(psFormation.matching_type, "8");
    assert.strictEqual(psFormation.matching_mna_formation.length, 1);
    assert.strictEqual(psFormation.matching_mna_formation[0].cle_ministere_educatif, "cle_1");
  });
});
