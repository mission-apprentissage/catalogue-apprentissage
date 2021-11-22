const assert = require("assert");
const { Formation, User } = require("../../../common/model");
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");
const { createCursor } = require("../export/index.js");
const sinon = require("sinon");
const parcoursupApi = require("../export/parcoursupApi");
const { createFormation, formatter } = require("../export");

describe(__filename, () => {
  before(async () => {
    // Connection to test collection
    await connectToMongoForTests();
    await User.deleteMany({});
    await Formation.deleteMany({});

    // insert sample data in DB
    await User.create({ email: "test@beta.gouv.fr", username: "test" });
    await User.create({ email: "test2@beta.gouv.fr", username: "test2" });

    // formations
    await Formation.create({
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "uai-1",
      id_rco_formation: "rco-1",
      bcn_mefs_10: [],
      rome_codes: ["rome-1", "rome-2"],
      parcoursup_statut: "hors périmètre",
      parcoursup_error: null,
      parcoursup_statut_history: [],
    });

    await Formation.create({
      rncp_code: null,
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "uai-2",
      id_rco_formation: "rco-2",
      bcn_mefs_10: [],
      rome_codes: ["rome-1", "rome-2"],
      parcoursup_statut: "en attente de publication",
      parcoursup_error: null,
      parcoursup_statut_history: [],
    });

    await Formation.create({
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: null,
      id_rco_formation: "rco-3",
      bcn_mefs_10: [],
      rome_codes: ["rome-1", "rome-2"],
      parcoursup_statut: "en attente de publication",
      parcoursup_error: null,
      parcoursup_statut_history: [],
    });

    await Formation.create({
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "uai-4",
      id_rco_formation: "rco-4",
      bcn_mefs_10: [{}, {}, {}],
      rome_codes: ["rome-1", "rome-2"],
      parcoursup_statut: "en attente de publication",
      parcoursup_error: null,
      parcoursup_statut_history: [],
    });

    await Formation.create({
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "uai-5",
      id_rco_formation: "rco-5",
      bcn_mefs_10: [{ mef10: "mef-5" }],
      rome_codes: ["rome-50", "rome-51"],
      parcoursup_statut: "en attente de publication",
      parcoursup_error: null,
      parcoursup_statut_history: [],
    });

    await Formation.create({
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "uai-6",
      id_rco_formation: "rco-6",
      bcn_mefs_10: [{ mef10: "mef-6" }],
      rome_codes: ["rome-60", "rome-61"],
      parcoursup_statut: "en attente de publication",
      parcoursup_error: "error ws",
      parcoursup_statut_history: [],
    });

    await Formation.create({
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "uai-7",
      id_rco_formation: "rco-7",
      bcn_mefs_10: [{ mef10: "mef-7" }],
      rome_codes: ["rome-70", "rome-71"],
      parcoursup_statut: "en attente de publication",
      parcoursup_error: "error ws",
      parcoursup_statut_history: [],
    });

    await Formation.create({
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "uai-8",
      id_rco_formation: "rco-8",
      bcn_mefs_10: [{ mef10: "mef-8" }],
      rome_codes: ["rome-80", "rome-81"],
      parcoursup_statut: "en attente de publication",
      parcoursup_error: null,
      parcoursup_statut_history: [],
    });
  });

  after(async () => {
    await cleanAll();
  });

  afterEach(() => {
    // clean mocks
    sinon.restore();
  });

  it("should have inserted sample data", async () => {
    const countFormations = await Formation.countDocuments({});
    assert.strictEqual(countFormations, 8);
  });

  it("should filter only 4 formations", async () => {
    let cursor = createCursor();
    let index = 0;
    while (await cursor.next()) {
      index += 1;
    }
    assert.strictEqual(index, 4);
  });

  it("should sort formations with errors at last", async () => {
    let cursor = createCursor();
    let index = 0;
    for await (const formation of cursor) {
      if (index < 2) {
        assert.strictEqual(formation.parcoursup_error, null);
      } else {
        assert.strictEqual(formation.parcoursup_error, "error ws");
      }

      if (index === 0) {
        assert.strictEqual(formation.id_rco_formation, "rco-5");
      }
      if (index === 1) {
        assert.strictEqual(formation.id_rco_formation, "rco-8");
      }
      if (index === 2) {
        assert.strictEqual(formation.id_rco_formation, "rco-6");
      }
      if (index === 3) {
        assert.strictEqual(formation.id_rco_formation, "rco-7");
      }
      index += 1;
    }
    assert.strictEqual(index, 4);
  });

  it("should create 1 formation on ps side", async () => {
    sinon.stub(parcoursupApi, "postFormation").returns({ g_ta_cod: "id-ps-1" });

    const f = new Formation({
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "uai-9",
      id_rco_formation: "rco-9",
      bcn_mefs_10: [{ mef10: "mef-9" }],
      rome_codes: ["rome-90", "rome-91"],
      parcoursup_statut: "en attente de publication",
      parcoursup_error: null,
      parcoursup_statut_history: [],
    });

    await f.save();

    await createFormation(f);

    assert.strictEqual(f.parcoursup_statut, "publié");
    assert.strictEqual(f.parcoursup_id, "id-ps-1");
  });

  it("should save error", async () => {
    sinon.stub(parcoursupApi, "postFormation").throws();

    const f = new Formation({
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "uai-10",
      id_rco_formation: "rco-10",
      bcn_mefs_10: [{ mef10: "mef-10" }],
      rome_codes: ["rome-100", "rome-101"],
      parcoursup_statut: "en attente de publication",
      parcoursup_error: null,
      parcoursup_statut_history: [],
    });

    await f.save();

    await createFormation(f);

    assert.strictEqual(f.parcoursup_statut, "en attente de publication");
    assert.strictEqual(f.parcoursup_error, "erreur de création");
  });

  it("should format properly", async () => {
    const formatted = await formatter({
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "123134",
      uai_formation: "uai-11",
      id_rco_formation: "rco-11",
      bcn_mefs_10: [{ mef10: "mef-11" }],
      rome_codes: ["rome-110", "rome-111"],
      parcoursup_statut: "en attente de publication",
      parcoursup_error: null,
      parcoursup_statut_history: [],
      updates_history: [
        {
          from: { parcoursup_statut: "à publier" },
          to: { parcoursup_statut: "en attente de publication", last_update_who: "test@beta.gouv.fr" },
        },
        { from: {}, to: {} },
      ],
    });

    const user = await User.findOne({ email: "test@beta.gouv.fr" });

    const expected = {
      user: user._id,
      cfd: "123134",
      mef: "mef-11",
      rco: "rco-11",
      rncp: [1234],
      rome: ["rome-110", "rome-111"],
      uai: "uai-11",
    };
    assert.deepStrictEqual(formatted, expected);
  });
});
