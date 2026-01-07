const assert = require("assert");
const { Formation, User } = require("../../../common/models");
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");
const { createCursor } = require("../export/index.js");
const sinon = require("sinon");
const parcoursupApi = require("../parcoursupApi");
const { createFormation, formatter } = require("../export");
const { PARCOURSUP_STATUS } = require("../../../constants/status");
const cfdEntreeFinder = require("../../../logic/finder/cfdEntreeFinder");
const { setupBeforeAll, setupAfterAll, setupAfterEach } = require("../../../../tests/helpers/setup");

describe(__filename, () => {
  before(async () => {
    setupBeforeAll();
    // Connection to test collection
    await connectToMongoForTests();
    await User.deleteMany({});
    await Formation.deleteMany({});

    // insert sample data in DB
    await User.create({ email: "test@beta.gouv.fr", username: "test" });
    await User.create({ email: "test2@beta.gouv.fr", username: "test2" });

    // formations
    await Formation.create({
      catalogue_published: true,
      published: true,
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "0551031X",
      parcoursup_mefs_10: [],
      parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
      parcoursup_error: null,
      parcoursup_statut_history: [],
      cle_ministere_educatif: "12345-cle",
    });

    await Formation.create({
      catalogue_published: true,
      published: true,
      rncp_code: null,
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "0881529J",
      parcoursup_mefs_10: [],
      parcoursup_statut: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
      parcoursup_error: null,
      parcoursup_statut_history: [],
      cle_ministere_educatif: "12345-cle2",
    });

    await Formation.create({
      catalogue_published: true,
      published: true,
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: undefined,
      parcoursup_mefs_10: [],
      parcoursup_statut: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
      parcoursup_error: null,
      parcoursup_statut_history: [],
      cle_ministere_educatif: "12345-cle3",
    });

    await Formation.create({
      catalogue_published: true,
      published: true,
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "0561732D",
      parcoursup_mefs_10: [{ mef10: "mef-41" }, { mef10: "mef-42" }, { mef10: "mef-43" }],
      parcoursup_statut: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
      parcoursup_error: null,
      parcoursup_statut_history: [],
      cle_ministere_educatif: "12345-cle4",
    });

    await Formation.create({
      catalogue_published: true,
      published: true,
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "0280706R",
      parcoursup_mefs_10: [{ mef10: "mef-5" }],
      parcoursup_statut: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
      parcoursup_error: null,
      parcoursup_statut_history: [],
      cle_ministere_educatif: "12345-cle5",
    });

    await Formation.create({
      catalogue_published: true,
      published: true,
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "0692514H",
      parcoursup_mefs_10: [{ mef10: "mef-6" }],
      parcoursup_statut: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
      parcoursup_error: "error ws",
      parcoursup_statut_history: [],
      cle_ministere_educatif: "12345-cle6",
      last_update_at: Date.now(),
    });

    await Formation.create({
      catalogue_published: true,
      published: true,
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "0783706E",
      parcoursup_mefs_10: [{ mef10: "mef-7" }],
      parcoursup_statut: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
      parcoursup_error: "error ws",
      parcoursup_statut_history: [],
      cle_ministere_educatif: "12345-cle7",
      last_update_at: Date.now() - 2000,
    });

    await Formation.create({
      catalogue_published: true,
      published: true,
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "0631904C",
      parcoursup_mefs_10: [{ mef10: "mef-8" }],
      parcoursup_statut: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
      parcoursup_error: null,
      parcoursup_statut_history: [],
      cle_ministere_educatif: "12345-cle8",
    });
  });

  after(async () => {
    setupAfterAll();
    await cleanAll();
  });

  afterEach(() => {
    setupAfterEach();
    // clean mocks
    sinon.restore();
  });

  it("should have inserted sample data", async () => {
    const countFormations = await Formation.countDocuments({});
    assert.strictEqual(countFormations, 8);
  });

  it("should filter only 6 formations", async () => {
    let cursor = createCursor();
    let index = 0;
    while (await cursor.next()) {
      index += 1;
    }
    assert.strictEqual(index, 6);
  });

  it("should sort formations with errors at last", async () => {
    let cursor = createCursor();
    let index = 0;
    for await (const formation of cursor) {
      if (index < 4) {
        assert.strictEqual(formation.parcoursup_error, null);
      } else {
        assert.strictEqual(formation.parcoursup_error, "error ws");
      }

      if (index === 0) {
        assert.strictEqual(formation.cle_ministere_educatif, "12345-cle2");
      }
      if (index === 1) {
        assert.strictEqual(formation.cle_ministere_educatif, "12345-cle4");
      }
      if (index === 2) {
        assert.strictEqual(formation.cle_ministere_educatif, "12345-cle5");
      }
      if (index === 3) {
        assert.strictEqual(formation.cle_ministere_educatif, "12345-cle8");
      }
      if (index === 4) {
        assert.strictEqual(formation.cle_ministere_educatif, "12345-cle7");
      }
      if (index === 5) {
        assert.strictEqual(formation.cle_ministere_educatif, "12345-cle6");
      }
      index += 1;
    }
    assert.strictEqual(index, 6);
  });

  it("should create 1 formation on ps side", async () => {
    sinon.stub(parcoursupApi, "postFormation").returns({ g_ta_cod: "id-ps-1" });
    sinon.stub(cfdEntreeFinder, "getCfdEntree").returns("1212");

    const f = new Formation({
      catalogue_published: true,
      published: true,
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "0320663X",
      parcoursup_mefs_10: [{ mef10: "mef-9" }],
      parcoursup_statut: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
      parcoursup_error: null,
      parcoursup_statut_history: [],
      cle_ministere_educatif: "12345-cle9",
    });

    await f.save();

    await createFormation(f);

    assert.strictEqual(f.parcoursup_statut, PARCOURSUP_STATUS.PUBLIE);
    assert.strictEqual(f.parcoursup_id, "id-ps-1");
  });

  it("should save error", async () => {
    sinon.stub(parcoursupApi, "postFormation").throws({ response: { status: 400 } });

    const f = new Formation({
      catalogue_published: true,
      published: true,
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "1212",
      uai_formation: "0755331M",
      parcoursup_mefs_10: [{ mef10: "mef-10" }],
      parcoursup_statut: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
      parcoursup_error: null,
      parcoursup_statut_history: [],
      cle_ministere_educatif: "12345-cle10",
    });

    await f.save();

    await createFormation(f);

    assert.strictEqual(f.parcoursup_statut, PARCOURSUP_STATUS.PRET_POUR_INTEGRATION);
    assert.strictEqual(f.parcoursup_error, "400 erreur de création");
  });

  it("should format properly", async () => {
    sinon.stub(cfdEntreeFinder, "getCfdEntree").returns("123134");

    const formatted = await formatter({
      catalogue_published: true,
      published: true,
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "123134",
      uai_formation: "0330176M",
      parcoursup_mefs_10: [{ mef10: "mef-11" }],
      parcoursup_statut: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
      parcoursup_error: null,
      parcoursup_id: "1234567",
      parcoursup_statut_history: [],
      updates_history: [
        {
          from: { parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER },
          to: { parcoursup_statut: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION, last_update_who: "test@beta.gouv.fr" },
        },
        { from: {}, to: {} },
      ],
      cle_ministere_educatif: "12345-cle11",
    });

    const user = await User.findOne({ email: "test@beta.gouv.fr" });

    const expected = {
      user: user._id,
      cfd: "123134",
      g_ta_cod: 1234567,
      mef: "mef-11",
      rco: "12345-cle11",
      rncp: [1234],
      uai: "0330176M",
    };
    assert.deepStrictEqual(formatted, expected);
  });

  it("should exclude mef from format if multiple are found", async () => {
    sinon.stub(cfdEntreeFinder, "getCfdEntree").returns("123134");

    const formatted = await formatter({
      rncp_code: "RNCP1234",
      cfd: "6789",
      cfd_entree: "123134",
      uai_formation: "0541370W",
      parcoursup_mefs_10: [{ mef10: "mef-12-1" }, { mef10: "mef-12-2" }],
      parcoursup_statut: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
      parcoursup_error: null,
      parcoursup_statut_history: [],
      updates_history: [
        {
          from: { parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER },
          to: { parcoursup_statut: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION, last_update_who: "test@beta.gouv.fr" },
        },
        { from: {}, to: {} },
      ],
      cle_ministere_educatif: "12345-cle12",
    });

    const user = await User.findOne({ email: "test@beta.gouv.fr" });

    const expected = {
      user: user._id,
      cfd: "123134",
      g_ta_cod: null,
      mef: "",
      rco: "12345-cle12",
      rncp: [1234],
      uai: "0541370W",
    };
    assert.deepStrictEqual(formatted, expected);
  });
});
