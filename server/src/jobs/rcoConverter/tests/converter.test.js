const assert = require("assert");
const fs = require("fs-extra");
const path = require("path");
const { RcoFormation } = require("../../../common/model/index");
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { performConversion } = require("../converter/converter.js");

const rcoSampleData = fs.readJsonSync(path.resolve(__dirname, "../assets/sample.json"));

describe(__filename, () => {
  before(async () => {
    // Connection to test collection
    await connectToMongoForTests();
    await RcoFormation.deleteMany({});

    // insert sample data in DB
    await asyncForEach(rcoSampleData, async (training) => await new RcoFormation(training).save());
  });

  after(async () => {
    await cleanAll();
  });

  it("should have inserted sample data", async () => {
    const count = await RcoFormation.countDocuments({});
    assert.strictEqual(count, 10);
  });

  it("should have converted data into Mna Formations", async () => {
    await performConversion();

    const count = await RcoFormation.countDocuments({});
    assert.strictEqual(count, 10);
  });
});
