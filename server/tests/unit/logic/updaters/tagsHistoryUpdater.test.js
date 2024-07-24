const assert = require("assert");
const { Formation } = require("../../../../src/common/models");
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");
const { asyncForEach } = require("../../../../src/common/utils/asyncUtils");
const { updateManyTagsHistory } = require("../../../../src/logic/updaters/tagsHistoryUpdater.js");
const { PARCOURSUP_STATUS, AFFELNET_STATUS } = require("../../../../src/constants/status");

const sampleData = [
  {
    cfd: "1",
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
    parcoursup_statut_history: [],
    affelnet_statut: AFFELNET_STATUS.A_PUBLIER,
    affelnet_statut_history: [
      {
        affelnet_statut: AFFELNET_STATUS.A_PUBLIER,
        date: new Date("2021-10-14"),
      },
    ],
    last_statut_update_date: new Date("2021-10-14"),
  },
  {
    cfd: "2",
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
    parcoursup_statut_history: [],
    affelnet_statut: AFFELNET_STATUS.A_PUBLIER,
    affelnet_statut_history: [
      {
        affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
        date: new Date("2022-01-10"),
      },
    ],
    last_statut_update_date: new Date("2022-01-10"),
  },
  {
    cfd: "3",
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
    parcoursup_statut_history: [
      {
        parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
        date: new Date("2021-10-14"),
      },
    ],
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
    affelnet_statut_history: [],
    last_statut_update_date: null,
  },
  {
    cfd: "4",
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
    parcoursup_statut_history: [
      {
        parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
        date: new Date("2022-02-04"),
      },
    ],
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
    affelnet_statut_history: [],
    last_statut_update_date: new Date("2022-02-04"),
  },
];

describe(__filename, () => {
  describe("updateManyTagsHistory", () => {
    beforeEach(async () => {
      // Connection to test collection
      await connectToMongoForTests();
      await Formation.deleteMany({});

      // insert sample data in DB
      await asyncForEach(sampleData, async (training) => await new Formation(training).save());
    });

    afterEach(async () => {
      await cleanAll();
    });

    it("should update history for affelnet", async () => {
      await updateManyTagsHistory("affelnet_statut");

      const formation1 = await Formation.findOne({ cfd: "1" });
      assert.strictEqual(formation1.affelnet_statut_history.length, 2);
      assert.strictEqual(formation1.affelnet_statut_history[0].affelnet_statut, AFFELNET_STATUS.A_PUBLIER);
      assert.strictEqual(formation1.affelnet_statut_history[1].affelnet_statut, AFFELNET_STATUS.A_PUBLIER);
      assert.deepStrictEqual(formation1.last_statut_update_date, new Date("2021-10-14"));

      const formation2 = await Formation.findOne({ cfd: "2" });
      assert.strictEqual(formation2.affelnet_statut_history.length, 2);
      assert.strictEqual(formation2.affelnet_statut_history[0].affelnet_statut, AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT);
      assert.strictEqual(formation2.affelnet_statut_history[1].affelnet_statut, AFFELNET_STATUS.A_PUBLIER);
      assert.notDeepStrictEqual(formation2.last_statut_update_date, new Date("2022-01-10"));
      assert.strictEqual(new Date(formation2.last_statut_update_date).getDate(), new Date().getDate());
      assert.strictEqual(new Date(formation2.last_statut_update_date).getFullYear(), new Date().getFullYear());
      assert.strictEqual(new Date(formation2.last_statut_update_date).getMonth(), new Date().getMonth());

      const formation3 = await Formation.findOne({ cfd: "3" });
      assert.strictEqual(formation3.affelnet_statut_history.length, 1);
      assert.strictEqual(formation3.affelnet_statut_history[0].affelnet_statut, AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT);
      assert.notDeepStrictEqual(formation3.last_statut_update_date, null);
      assert.strictEqual(new Date(formation3.last_statut_update_date).getDate(), new Date().getDate());
      assert.strictEqual(new Date(formation3.last_statut_update_date).getFullYear(), new Date().getFullYear());
      assert.strictEqual(new Date(formation3.last_statut_update_date).getMonth(), new Date().getMonth());

      const formation4 = await Formation.findOne({ cfd: "4" });
      assert.strictEqual(formation4.affelnet_statut_history.length, 1);
      assert.strictEqual(formation4.affelnet_statut_history[0].affelnet_statut, AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT);
      assert.notDeepStrictEqual(formation4.last_statut_update_date, new Date("2022-02-04"));
      assert.strictEqual(new Date(formation4.last_statut_update_date).getDate(), new Date().getDate());
      assert.strictEqual(new Date(formation4.last_statut_update_date).getFullYear(), new Date().getFullYear());
      assert.strictEqual(new Date(formation4.last_statut_update_date).getMonth(), new Date().getMonth());
    });

    it("should update history for parcoursup", async () => {
      await updateManyTagsHistory("parcoursup_statut");

      const formation1 = await Formation.findOne({ cfd: "1" });
      assert.strictEqual(formation1.parcoursup_statut_history.length, 1);
      assert.strictEqual(
        formation1.parcoursup_statut_history[0].parcoursup_statut,
        PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT
      );
      assert.notDeepStrictEqual(formation1.last_statut_update_date, new Date("2021-10-14"));
      assert.strictEqual(new Date(formation1.last_statut_update_date).getDate(), new Date().getDate());
      assert.strictEqual(new Date(formation1.last_statut_update_date).getFullYear(), new Date().getFullYear());
      assert.strictEqual(new Date(formation1.last_statut_update_date).getMonth(), new Date().getMonth());

      const formation2 = await Formation.findOne({ cfd: "2" });
      assert.strictEqual(formation2.parcoursup_statut_history.length, 1);
      assert.strictEqual(
        formation2.parcoursup_statut_history[0].parcoursup_statut,
        PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT
      );
      assert.notDeepStrictEqual(formation2.last_statut_update_date, new Date("2022-01-10"));
      assert.strictEqual(new Date(formation2.last_statut_update_date).getDate(), new Date().getDate());
      assert.strictEqual(new Date(formation2.last_statut_update_date).getFullYear(), new Date().getFullYear());
      assert.strictEqual(new Date(formation2.last_statut_update_date).getMonth(), new Date().getMonth());

      const formation3 = await Formation.findOne({ cfd: "3" });
      assert.strictEqual(formation3.parcoursup_statut_history.length, 2);
      assert.strictEqual(
        formation3.parcoursup_statut_history[0].parcoursup_statut,
        PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT
      );
      assert.strictEqual(formation3.parcoursup_statut_history[1].parcoursup_statut, PARCOURSUP_STATUS.A_PUBLIER);
      assert.notDeepStrictEqual(formation3.last_statut_update_date, null);
      assert.strictEqual(new Date(formation3.last_statut_update_date).getDate(), new Date().getDate());
      assert.strictEqual(new Date(formation3.last_statut_update_date).getFullYear(), new Date().getFullYear());
      assert.strictEqual(new Date(formation3.last_statut_update_date).getMonth(), new Date().getMonth());

      const formation4 = await Formation.findOne({ cfd: "4" });
      assert.strictEqual(formation4.parcoursup_statut_history.length, 2);
      assert.strictEqual(formation4.parcoursup_statut_history[0].parcoursup_statut, PARCOURSUP_STATUS.A_PUBLIER);
      assert.strictEqual(formation4.parcoursup_statut_history[1].parcoursup_statut, PARCOURSUP_STATUS.A_PUBLIER);
      assert.deepStrictEqual(formation4.last_statut_update_date, new Date("2022-02-04"));
    });
  });
});
