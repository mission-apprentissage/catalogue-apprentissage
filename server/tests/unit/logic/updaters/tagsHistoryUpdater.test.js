const assert = require("assert");
const { Formation } = require("../../../../src/common/model/index");
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");
const { asyncForEach } = require("../../../../src/common/utils/asyncUtils");
const { updateTagsHistory } = require("../../../../src/logic/updaters/tagsHistoryUpdater.js");

const sampleData = [
  {
    cfd: "1",
    published: true,
    parcoursup_statut: "hors périmètre",
    parcoursup_statut_history: [],
    affelnet_statut: "à publier",
    affelnet_statut_history: [
      {
        affelnet_statut: "à publier",
        date: new Date("2021-10-14"),
      },
    ],
    last_statut_update_date: new Date("2021-10-14"),
  },
  {
    cfd: "2",
    published: true,
    parcoursup_statut: "hors périmètre",
    parcoursup_statut_history: [],
    affelnet_statut: "à publier",
    affelnet_statut_history: [
      {
        affelnet_statut: "hors périmètre",
        date: new Date("2022-01-10"),
      },
    ],
    last_statut_update_date: new Date("2022-01-10"),
  },
  {
    cfd: "3",
    published: true,
    parcoursup_statut: "à publier",
    parcoursup_statut_history: [
      {
        parcoursup_statut: "hors périmètre",
        date: new Date("2021-10-14"),
      },
    ],
    affelnet_statut: "hors périmètre",
    affelnet_statut_history: [],
    last_statut_update_date: null,
  },
  {
    cfd: "4",
    published: true,
    parcoursup_statut: "à publier",
    parcoursup_statut_history: [
      {
        parcoursup_statut: "à publier",
        date: new Date("2022-02-04"),
      },
    ],
    affelnet_statut: "hors périmètre",
    affelnet_statut_history: [],
    last_statut_update_date: new Date("2022-02-04"),
  },
];

describe(__filename, () => {
  describe("updateTagsHistory", () => {
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
      await updateTagsHistory("affelnet_statut");

      const formation1 = await Formation.findOne({ cfd: "1" });
      assert.strictEqual(formation1.affelnet_statut_history.length, 2);
      assert.strictEqual(formation1.affelnet_statut_history[0].affelnet_statut, "à publier");
      assert.strictEqual(formation1.affelnet_statut_history[1].affelnet_statut, "à publier");
      assert.deepStrictEqual(formation1.last_statut_update_date, new Date("2021-10-14"));

      const formation2 = await Formation.findOne({ cfd: "2" });
      assert.strictEqual(formation2.affelnet_statut_history.length, 2);
      assert.strictEqual(formation2.affelnet_statut_history[0].affelnet_statut, "hors périmètre");
      assert.strictEqual(formation2.affelnet_statut_history[1].affelnet_statut, "à publier");
      assert.notDeepStrictEqual(formation2.last_statut_update_date, new Date("2022-01-10"));
      assert.strictEqual(new Date(formation2.last_statut_update_date).getDate(), new Date().getDate());
      assert.strictEqual(new Date(formation2.last_statut_update_date).getFullYear(), new Date().getFullYear());
      assert.strictEqual(new Date(formation2.last_statut_update_date).getMonth(), new Date().getMonth());

      const formation3 = await Formation.findOne({ cfd: "3" });
      assert.strictEqual(formation3.affelnet_statut_history.length, 1);
      assert.strictEqual(formation3.affelnet_statut_history[0].affelnet_statut, "hors périmètre");
      assert.notDeepStrictEqual(formation3.last_statut_update_date, null);
      assert.strictEqual(new Date(formation3.last_statut_update_date).getDate(), new Date().getDate());
      assert.strictEqual(new Date(formation3.last_statut_update_date).getFullYear(), new Date().getFullYear());
      assert.strictEqual(new Date(formation3.last_statut_update_date).getMonth(), new Date().getMonth());

      const formation4 = await Formation.findOne({ cfd: "4" });
      assert.strictEqual(formation4.affelnet_statut_history.length, 1);
      assert.strictEqual(formation4.affelnet_statut_history[0].affelnet_statut, "hors périmètre");
      assert.notDeepStrictEqual(formation4.last_statut_update_date, new Date("2022-02-04"));
      assert.strictEqual(new Date(formation4.last_statut_update_date).getDate(), new Date().getDate());
      assert.strictEqual(new Date(formation4.last_statut_update_date).getFullYear(), new Date().getFullYear());
      assert.strictEqual(new Date(formation4.last_statut_update_date).getMonth(), new Date().getMonth());
    });

    it("should update history for parcoursup", async () => {
      await updateTagsHistory("parcoursup_statut");

      const formation1 = await Formation.findOne({ cfd: "1" });
      assert.strictEqual(formation1.parcoursup_statut_history.length, 1);
      assert.strictEqual(formation1.parcoursup_statut_history[0].parcoursup_statut, "hors périmètre");
      assert.notDeepStrictEqual(formation1.last_statut_update_date, new Date("2021-10-14"));
      assert.strictEqual(new Date(formation1.last_statut_update_date).getDate(), new Date().getDate());
      assert.strictEqual(new Date(formation1.last_statut_update_date).getFullYear(), new Date().getFullYear());
      assert.strictEqual(new Date(formation1.last_statut_update_date).getMonth(), new Date().getMonth());

      const formation2 = await Formation.findOne({ cfd: "2" });
      assert.strictEqual(formation2.parcoursup_statut_history.length, 1);
      assert.strictEqual(formation2.parcoursup_statut_history[0].parcoursup_statut, "hors périmètre");
      assert.notDeepStrictEqual(formation2.last_statut_update_date, new Date("2022-01-10"));
      assert.strictEqual(new Date(formation2.last_statut_update_date).getDate(), new Date().getDate());
      assert.strictEqual(new Date(formation2.last_statut_update_date).getFullYear(), new Date().getFullYear());
      assert.strictEqual(new Date(formation2.last_statut_update_date).getMonth(), new Date().getMonth());

      const formation3 = await Formation.findOne({ cfd: "3" });
      assert.strictEqual(formation3.parcoursup_statut_history.length, 2);
      assert.strictEqual(formation3.parcoursup_statut_history[0].parcoursup_statut, "hors périmètre");
      assert.strictEqual(formation3.parcoursup_statut_history[1].parcoursup_statut, "à publier");
      assert.notDeepStrictEqual(formation3.last_statut_update_date, null);
      assert.strictEqual(new Date(formation3.last_statut_update_date).getDate(), new Date().getDate());
      assert.strictEqual(new Date(formation3.last_statut_update_date).getFullYear(), new Date().getFullYear());
      assert.strictEqual(new Date(formation3.last_statut_update_date).getMonth(), new Date().getMonth());

      const formation4 = await Formation.findOne({ cfd: "4" });
      assert.strictEqual(formation4.parcoursup_statut_history.length, 2);
      assert.strictEqual(formation4.parcoursup_statut_history[0].parcoursup_statut, "à publier");
      assert.strictEqual(formation4.parcoursup_statut_history[1].parcoursup_statut, "à publier");
      assert.deepStrictEqual(formation4.last_statut_update_date, new Date("2022-02-04"));
    });
  });
});
