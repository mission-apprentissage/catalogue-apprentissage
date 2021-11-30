const assert = require("assert");
const { Formation } = require("../../../common/model/index");
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { findPreviousFormations } = require("../converter/migrationFinder");

const sampleData = [
  {
    id_rco_formation: "1",
    published: true,
    id_formation: "123",
    id_certifinfo: "097",
    ids_action: ["1111", "2222", "0101"],
  },
  {
    id_rco_formation: "2",
    published: true,
    id_formation: "123",
    id_certifinfo: "097",
    ids_action: ["999"],
  },
  {
    id_rco_formation: "3",
    published: true,
    id_formation: "123",
    id_certifinfo: "097",
    ids_action: ["888", "555"],
  },
  {
    id_rco_formation: "4",
    published: true,
    id_formation: "649",
    id_certifinfo: "881",
    ids_action: ["123", "456", "789"],
  },
  {
    id_rco_formation: "5",
    published: true,
    id_formation: "649",
    id_certifinfo: "881",
    ids_action: [],
  },
  {
    id_rco_formation: "6",
    published: true,
    id_formation: "649",
    id_certifinfo: "097",
    ids_action: ["666", "444"],
  },
];

describe(__filename, () => {
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
    assert.strictEqual(count, 6);
  });

  it("should find 1 Formation", async () => {
    const formations = await findPreviousFormations({
      id_formation: "123",
      id_certifinfo: "097",
      id_action: "1111|87654|2222|0101|0987654",
    });

    assert.strictEqual(formations.length, 1);
    assert.strictEqual(formations[0].id_rco_formation, "1");
  });

  it("should find 2 Formation", async () => {
    const formations = await findPreviousFormations({
      id_formation: "123",
      id_certifinfo: "097",
      id_action: "999|87654|888|0101|555",
    });

    assert.strictEqual(formations.length, 2);
    assert.strictEqual(formations[0].id_rco_formation, "2");
    assert.strictEqual(formations[1].id_rco_formation, "3");
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
});
