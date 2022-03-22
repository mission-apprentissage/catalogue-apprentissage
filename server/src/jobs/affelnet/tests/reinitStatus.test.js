const assert = require("assert");
const { Formation } = require("../../../common/model/index");
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");
const afReinitStatus = require("../reinitStatus");
const { run, allHistoryIsEnAttenteAfterDate, lastHistoryIsEnAttenteBeforeDate } = require("../reinitStatus/controller");
const { AFFELNET_STATUS } = require("../../../constants/status");

describe(__filename, () => {
  const date = new Date("2022-09-01");
  const query = {
    published: true,
    affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
  };

  beforeEach(async () => {
    // Connection to test collection
    await connectToMongoForTests();
    await Formation.deleteMany({});

    // allHistoryIsEnAttenteAfterDate YES
    // lastHistoryIsEnAttenteBeforeDate YES
    await Formation.create({
      published: true,
      affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
      cle_ministere_educatif: "cle_1",
      intitule_court: "formation 1",
      updates_history: [
        {
          to: {
            affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
          },
          updated_at: new Date("2022-08-15"),
        },
        {
          to: {
            affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
          },
          updated_at: new Date("2022-09-15"),
        },
        {
          to: {
            affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
          },
          updated_at: new Date("2022-10-15"),
        },
      ],
    });

    // allHistoryIsEnAttenteAfterDate NO
    // lastHistoryIsEnAttenteBeforeDate YES
    await Formation.create({
      published: true,
      affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
      cle_ministere_educatif: "cle_2",
      intitule_court: "formation 2",
      updates_history: [
        {
          to: {
            affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
          },
          updated_at: new Date("2022-08-15"),
        },
        {
          to: {
            affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
          },
          updated_at: new Date("2022-09-15"),
        },
        {
          to: {
            affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
          },
          updated_at: new Date("2022-10-15"),
        },
      ],
    });

    // allHistoryIsEnAttenteAfterDate NO
    // lastHistoryIsEnAttenteBeforeDate NO
    await Formation.create({
      published: true,
      affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
      cle_ministere_educatif: "cle_3",
      intitule_court: "formation 3",
      updates_history: [
        {
          to: {
            affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
          },
          updated_at: new Date("2022-08-15"),
        },
        {
          to: {
            affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
          },
          updated_at: new Date("2022-09-15"),
        },
        {
          to: {
            affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
          },
          updated_at: new Date("2022-10-15"),
        },
      ],
    });

    // allHistoryIsEnAttenteAfterDate NO
    // lastHistoryIsEnAttenteBeforeDate YES
    await Formation.create({
      published: true,
      affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
      cle_ministere_educatif: "cle_4",
      intitule_court: "formation 4",
      updates_history: [
        {
          to: {
            affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
          },
          updated_at: new Date("2022-08-15"),
        },
        {
          to: {
            affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
          },
          updated_at: new Date("2022-09-15"),
        },
        {
          to: {
            affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
          },
          updated_at: new Date("2022-10-15"),
        },
      ],
    });

    // allHistoryIsEnAttenteAfterDate YES
    // lastHistoryIsEnAttenteBeforeDate NO
    await Formation.create({
      published: false,
      affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
      cle_ministere_educatif: "cle_5",
      intitule_court: "formation 5",
      updates_history: [],
    });
  });

  afterEach(async () => {
    await cleanAll();
  });

  describe("controller > allHistoryIsEnAttenteAfterDate", () => {
    it("should have inserted sample data", async () => {
      const countFormations = await Formation.countDocuments({});
      assert.strictEqual(countFormations, 5);
    });

    it("should work as expected", async () => {
      const formation_1 = await Formation.findOne({ cle_ministere_educatif: "cle_1" });
      const check1 = allHistoryIsEnAttenteAfterDate(formation_1, date);

      const formation_2 = await Formation.findOne({ cle_ministere_educatif: "cle_2" });
      const check2 = allHistoryIsEnAttenteAfterDate(formation_2, date);

      const formation_3 = await Formation.findOne({ cle_ministere_educatif: "cle_3" });
      const check3 = allHistoryIsEnAttenteAfterDate(formation_3, date);

      const formation_4 = await Formation.findOne({ cle_ministere_educatif: "cle_4" });
      const check4 = allHistoryIsEnAttenteAfterDate(formation_4, date);

      const formation_5 = await Formation.findOne({ cle_ministere_educatif: "cle_5" });
      const check5 = allHistoryIsEnAttenteAfterDate(formation_5, date);

      assert.strictEqual(check1, true);
      assert.strictEqual(check2, false);
      assert.strictEqual(check3, false);
      assert.strictEqual(check4, false);
      assert.strictEqual(check5, true);
    });
  });

  describe("controller > lastHistoryIsEnAttenteBeforeDate", () => {
    it("should have inserted sample data", async () => {
      const countFormations = await Formation.countDocuments({});
      assert.strictEqual(countFormations, 5);
    });

    it("should work as expected", async () => {
      const formation_1 = await Formation.findOne({ cle_ministere_educatif: "cle_1" });
      const check1 = lastHistoryIsEnAttenteBeforeDate(formation_1, date);

      const formation_2 = await Formation.findOne({ cle_ministere_educatif: "cle_2" });
      const check2 = lastHistoryIsEnAttenteBeforeDate(formation_2, date);

      const formation_3 = await Formation.findOne({ cle_ministere_educatif: "cle_3" });
      const check3 = lastHistoryIsEnAttenteBeforeDate(formation_3, date);

      const formation_4 = await Formation.findOne({ cle_ministere_educatif: "cle_4" });
      const check4 = lastHistoryIsEnAttenteBeforeDate(formation_4, date);

      const formation_5 = await Formation.findOne({ cle_ministere_educatif: "cle_5" });
      const check5 = lastHistoryIsEnAttenteBeforeDate(formation_5, date);

      assert.strictEqual(check1, true);
      assert.strictEqual(check2, true);
      assert.strictEqual(check3, false);
      assert.strictEqual(check4, true);
      assert.strictEqual(check5, false);
    });
  });

  describe("controller > run", () => {
    it("should have inserted sample data", async () => {
      const countFormations = await Formation.countDocuments({});
      assert.strictEqual(countFormations, 5);
    });

    it("should reinit affelnet statut", async () => {
      const countFormationsBefore = await Formation.countDocuments(query);

      assert.strictEqual(countFormationsBefore, 3);

      await run(date);

      const countFormationsAfter = await Formation.countDocuments(query);

      assert.strictEqual(countFormationsAfter, 2);
    });
  });

  describe("afReinitStatus", () => {
    it("should reinit affelnet statut", async () => {
      const countFormationsBefore = await Formation.countDocuments(query);

      assert.strictEqual(countFormationsBefore, 3);

      await afReinitStatus({ date });

      const countFormationsAfter = await Formation.countDocuments(query);

      assert.strictEqual(countFormationsAfter, 2);

      assert.deepStrictEqual(
        (await Formation.find(query)).map((formation) => formation.cle_ministere_educatif),
        ["cle_2", "cle_3"]
      );
    });
  });
});
