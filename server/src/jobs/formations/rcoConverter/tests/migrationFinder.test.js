const assert = require("assert");
const { Formation } = require("../../../../common/model/index");
const { connectToMongoForTests, cleanAll } = require("../../../../../tests/utils/testUtils.js");
const { asyncForEach } = require("../../../../common/utils/asyncUtils");
const { findPreviousFormations, copyComputedFields } = require("../converter/migrationFinder");

const sampleData = [
  {
    cfd: "1",
    published: true,
    id_formation: "123",
    id_certifinfo: "097",
    ids_action: ["1111", "2222", "0101"],
  },
  {
    cfd: "2",
    published: true,
    id_formation: "123",
    id_certifinfo: "097",
    ids_action: ["999"],
  },
  {
    cfd: "3",
    published: true,
    id_formation: "123",
    id_certifinfo: "097",
    ids_action: ["888", "555"],
  },
  {
    cfd: "4",
    published: true,
    id_formation: "649",
    id_certifinfo: "881",
    ids_action: ["123", "456", "789"],
  },
  {
    cfd: "5",
    published: true,
    id_formation: "649",
    id_certifinfo: "881",
    ids_action: [],
  },
  {
    cfd: "6",
    published: true,
    id_formation: "649",
    id_certifinfo: "097",
    ids_action: ["666", "444"],
  },
  {
    cfd: "7",
    cle_ministere_educatif: "094419P012X7842027560015078420275600150-92062#L01",
    published: true,
    annee: "X",
    id_action: "14_SE_0000652184##14_SE_0000652185",
    id_certifinfo: "94419",
    id_formation: "14_AF_0000003848",
    id_rco_formation: "14_AF_0000003848|14_SE_0000652184##14_SE_0000652185|94419",
    ids_action: ["14_SE_0000652184", "14_SE_0000652185"],
  },
];

describe(__filename, () => {
  describe("findPreviousFormations", () => {
    before(async () => {
      // Connection to test collection
      await connectToMongoForTests();
      await Formation.deleteMany({});

      // insert sample data in DB
      await asyncForEach(sampleData, async (training) => await new Formation(training).save());
    });

    after(async () => {
      await cleanAll();
    });

    it("should have inserted sample data", async () => {
      const count = await Formation.countDocuments({});
      assert.strictEqual(count, 7);
    });

    it("should find 1 Formation", async () => {
      const formations = await findPreviousFormations({
        id_formation: "123",
        id_certifinfo: "097",
        id_action: "1111|87654|2222|0101|0987654",
      });

      assert.strictEqual(formations.length, 1);
      assert.strictEqual(formations[0].cfd, "1");
    });

    it("should find 2 Formation", async () => {
      const formations = await findPreviousFormations({
        id_formation: "123",
        id_certifinfo: "097",
        id_action: "999|87654|888|0101|555",
      });

      assert.strictEqual(formations.length, 2);
      assert.strictEqual(formations[0].cfd, "2");
      assert.strictEqual(formations[1].cfd, "3");
    });

    it("should find 0 Formation", async () => {
      const formations = await findPreviousFormations({
        id_formation: "649",
        id_certifinfo: "881",
        id_action: "999|87654|888|0101|555",
      });

      assert.strictEqual(formations.length, 0);
    });

    it("should find 2 Formations", async () => {
      const formations = await findPreviousFormations({
        id_formation: "649##123",
        id_certifinfo: "097",
        id_action: "666|444##888|555",
      });

      assert.strictEqual(formations.length, 2);
    });

    it("should find 1 Formation", async () => {
      const formations = await findPreviousFormations({
        id_formation: "14_AF_0000003848",
        id_action: "14_SE_0000652184##14_SE_0000652185",
        id_certifinfo: "94419",
        cle_ministere_educatif: "094419P01217842027560015078420275600150-92062#L01",
        etablissement_formateur_code_insee: "92062",
      });

      assert.strictEqual(formations.length, 1);
      assert.strictEqual(formations[0].cfd, "7");
    });
  });

  describe("copyComputedFields", () => {
    it("should copy computed fields", async () => {
      const oldFormation = {
        distance: 1892,
        lieu_formation_geo_coordonnees_computed: "48.938269,7.676396",
        lieu_formation_adresse_computed: "25 Route de Strasbourg, 67110 Reichshoffen",
      };

      const newFormation = copyComputedFields(oldFormation, {});

      assert.strictEqual(newFormation.distance, oldFormation.distance);
      assert.strictEqual(newFormation.lieu_formation_adresse_computed, oldFormation.lieu_formation_adresse_computed);
      assert.strictEqual(
        newFormation.lieu_formation_geo_coordonnees_computed,
        oldFormation.lieu_formation_geo_coordonnees_computed
      );
    });
  });
});
