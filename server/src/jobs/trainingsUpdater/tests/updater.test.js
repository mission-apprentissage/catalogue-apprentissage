const assert = require("assert");
const fs = require("fs-extra");
const path = require("path");
const { Formation } = require("../../../common/model/index");
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { run } = require("../updater/updater.js");

const trainingsTest = fs.readJsonSync(path.resolve(__dirname, "../assets/sample.json"));

describe(__filename, () => {
  before(async () => {
    // Connection to test collection
    await connectToMongoForTests();
    await Formation.deleteMany({});

    // insert sample data in DB
    await asyncForEach(trainingsTest, async (training) => await new Formation(training).save());
  });

  after(async () => {
    // await cleanAll();
  });

  it("should have inserted sample data", async () => {
    const count = await Formation.countDocuments({});
    assert.strictEqual(count, 10);
  });

  it("should have updated data with tables-correspondance api call", async () => {
    await run();

    const count = await Formation.countDocuments({});
    assert.strictEqual(count, 10);
  });
});
