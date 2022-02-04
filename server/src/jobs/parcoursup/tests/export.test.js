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
      uai_formation: "0551031X",
      parcoursup_mefs_10: [],
      rome_codes: ["rome-1", "rome-2"],
      parcoursup_statut: "hors périmètre",
      parcoursup_error: null,
      parcoursup_statut_history: [],
      cle_ministere_educatif: "12345-cle",
    });

    await Formation.create({
      rncp_code: null,
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "0881529J",
      parcoursup_mefs_10: [],
      rome_codes: ["rome-1", "rome-2"],
      parcoursup_statut: "en attente de publication",
      parcoursup_error: null,
      parcoursup_statut_history: [],
      cle_ministere_educatif: "12345-cle2",
    });

    await Formation.create({
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: undefined,
      parcoursup_mefs_10: [],
      rome_codes: ["rome-1", "rome-2"],
      parcoursup_statut: "en attente de publication",
      parcoursup_error: null,
      parcoursup_statut_history: [],
      cle_ministere_educatif: "12345-cle3",
    });

    await Formation.create({
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "0561732D",
      parcoursup_mefs_10: [{ mef10: "mef-41" }, { mef10: "mef-42" }, { mef10: "mef-43" }],
      rome_codes: ["rome-1", "rome-2"],
      parcoursup_statut: "en attente de publication",
      parcoursup_error: null,
      parcoursup_statut_history: [],
      cle_ministere_educatif: "12345-cle4",
    });

    await Formation.create({
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "0280706R",
      parcoursup_mefs_10: [{ mef10: "mef-5" }],
      rome_codes: ["rome-50", "rome-51"],
      parcoursup_statut: "en attente de publication",
      parcoursup_error: null,
      parcoursup_statut_history: [],
      cle_ministere_educatif: "12345-cle5",
    });

    await Formation.create({
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "0692514H",
      parcoursup_mefs_10: [{ mef10: "mef-6" }],
      rome_codes: ["rome-60", "rome-61"],
      parcoursup_statut: "en attente de publication",
      parcoursup_error: "error ws",
      parcoursup_statut_history: [],
      cle_ministere_educatif: "12345-cle6",
      last_update_at: Date.now(),
    });

    await Formation.create({
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "0783706E",
      parcoursup_mefs_10: [{ mef10: "mef-7" }],
      rome_codes: ["rome-70", "rome-71"],
      parcoursup_statut: "en attente de publication",
      parcoursup_error: "error ws",
      parcoursup_statut_history: [],
      cle_ministere_educatif: "12345-cle7",
      last_update_at: Date.now() - 2000,
    });

    await Formation.create({
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "0631904C",
      parcoursup_mefs_10: [{ mef10: "mef-8" }],
      rome_codes: ["rome-80", "rome-81"],
      parcoursup_statut: "en attente de publication",
      parcoursup_error: null,
      parcoursup_statut_history: [],
      cle_ministere_educatif: "12345-cle8",
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

  it("should filter only 5 formations", async () => {
    let cursor = createCursor();
    let index = 0;
    while (await cursor.next()) {
      index += 1;
    }
    assert.strictEqual(index, 5);
  });

  it("should sort formations with errors at last", async () => {
    let cursor = createCursor();
    let index = 0;
    for await (const formation of cursor) {
      if (index < 3) {
        assert.strictEqual(formation.parcoursup_error, null);
      } else {
        assert.strictEqual(formation.parcoursup_error, "error ws");
      }

      if (index === 0) {
        assert.strictEqual(formation.cle_ministere_educatif, "12345-cle4");
      }
      if (index === 1) {
        assert.strictEqual(formation.cle_ministere_educatif, "12345-cle5");
      }
      if (index === 2) {
        assert.strictEqual(formation.cle_ministere_educatif, "12345-cle8");
      }
      if (index === 3) {
        assert.strictEqual(formation.cle_ministere_educatif, "12345-cle7");
      }
      if (index === 4) {
        assert.strictEqual(formation.cle_ministere_educatif, "12345-cle6");
      }
      index += 1;
    }
    assert.strictEqual(index, 5);
  });

  it("should create 1 formation on ps side", async () => {
    sinon.stub(parcoursupApi, "postFormation").returns({ g_ta_cod: "id-ps-1" });

    const f = new Formation({
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "0320663X",
      parcoursup_mefs_10: [{ mef10: "mef-9" }],
      rome_codes: ["rome-90", "rome-91"],
      parcoursup_statut: "en attente de publication",
      parcoursup_error: null,
      parcoursup_statut_history: [],
      cle_ministere_educatif: "12345-cle9",
    });

    await f.save();

    await createFormation(f);

    assert.strictEqual(f.parcoursup_statut, "publié");
    assert.strictEqual(f.parcoursup_id, "id-ps-1");
  });

  it("should save error", async () => {
    sinon.stub(parcoursupApi, "postFormation").throws({ response: { status: 400 } });

    const f = new Formation({
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "0755331M",
      parcoursup_mefs_10: [{ mef10: "mef-10" }],
      rome_codes: ["rome-100", "rome-101"],
      parcoursup_statut: "en attente de publication",
      parcoursup_error: null,
      parcoursup_statut_history: [],
      cle_ministere_educatif: "12345-cle10",
    });

    await f.save();

    await createFormation(f);

    assert.strictEqual(f.parcoursup_statut, "en attente de publication");
    assert.strictEqual(f.parcoursup_error, "400 erreur de création");
  });

  it("should format properly", async () => {
    const formatted = await formatter({
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "123134",
      uai_formation: "0330176M",
      parcoursup_mefs_10: [{ mef10: "mef-11" }],
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
      cle_ministere_educatif: "12345-cle11",
    });

    const user = await User.findOne({ email: "test@beta.gouv.fr" });

    const expected = {
      user: user._id,
      cfd: "123134",
      mef: "mef-11",
      rco: "12345-cle11",
      rncp: [1234],
      rome: ["rome-110", "rome-111"],
      uai: "0330176M",
    };
    assert.deepStrictEqual(formatted, expected);
  });

  it("should exclude mef from format if multiple are found", async () => {
    const formatted = await formatter({
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "123134",
      uai_formation: "0541370W",
      parcoursup_mefs_10: [{ mef10: "mef-12-1" }, { mef10: "mef-12-2" }],
      rome_codes: ["rome-120", "rome-121"],
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
      cle_ministere_educatif: "12345-cle12",
    });

    const user = await User.findOne({ email: "test@beta.gouv.fr" });

    const expected = {
      user: user._id,
      cfd: "123134",
      mef: "",
      rco: "12345-cle12",
      rncp: [1234],
      rome: ["rome-120", "rome-121"],
      uai: "0541370W",
    };
    assert.deepStrictEqual(formatted, expected);
  });
});
