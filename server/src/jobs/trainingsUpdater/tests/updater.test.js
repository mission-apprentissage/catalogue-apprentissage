const assert = require("assert");
const fs = require("fs-extra");
const path = require("path");
const { MnaFormation } = require("../../../common/model/index");
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { performUpdates } = require("../updater/updater.js");

const trainingsTest = fs.readJsonSync(path.resolve(__dirname, "../assets/sample.json"));

describe(__filename, () => {
  before(async () => {
    // Connection to test collection
    await connectToMongoForTests();
    await MnaFormation.deleteMany({});

    // insert sample data in DB
    await asyncForEach(trainingsTest, async (training) => await new MnaFormation(training).save());
  });

  after(async () => {
    await cleanAll();
  });

  it("should have inserted sample data", async () => {
    const count = await MnaFormation.countDocuments({});
    assert.strictEqual(count, 10);
  });

  it("should have updated data with tables-correspondance api call", async () => {
    await performUpdates(MnaFormation, {});

    const count = await MnaFormation.countDocuments({});
    assert.strictEqual(count, 10);
  });
});
