const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");
const { Report } = require("../../../../src/common/model/index");
const assert = require("assert");
const { storeByChunks } = require("../../../../src/common/utils/reportUtils");

describe(__filename, () => {
  before(async () => {
    // Connection to test collection
    await connectToMongoForTests();
  });

  after(async () => {
    await cleanAll();
  });

  beforeEach(async () => {
    await Report.deleteMany({});
  });

  it("should be empty", async () => {
    const count = await Report.countDocuments({});
    assert.strictEqual(count, 0);
  });

  it("should create 1 report only under 250 data", async () => {
    const date = Date.now();
    const type = "rcoImport";

    await storeByChunks(type, date, { title: "hello" }, "added", [...Array(250).keys()]);

    const count = await Report.countDocuments({});
    assert.strictEqual(count, 1);
  });

  it("should create 2 reports because of chunks after 250 data", async () => {
    const date = Date.now();
    const type = "rcoImport";

    await storeByChunks(type, date, { title: "hello" }, "added", [...Array(500).keys()]);

    const count = await Report.countDocuments({});
    assert.strictEqual(count, 2);
  });

  it("should create 3 reports because of chunks after 500 data", async () => {
    const date = Date.now();
    const type = "rcoImport";

    await storeByChunks(type, date, { title: "hello" }, "added", [...Array(501).keys()]);

    const count = await Report.countDocuments({});
    assert.strictEqual(count, 3);
  });

  it("should use uuid to find reports", async () => {
    const date = Date.now();
    const type = "rcoImport";

    await storeByChunks(type, date, { title: "hello" }, "added", [...Array(500).keys()], "test-uid");
    await storeByChunks(type, date, { title: "hello" }, "added", [...Array(10).keys()], "test-uid2");

    const count = await Report.countDocuments({ uuid: "test-uid2" });
    assert.strictEqual(count, 1);
  });
});
