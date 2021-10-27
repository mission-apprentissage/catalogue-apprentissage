const assert = require("assert");
const fs = require("fs-extra");
const path = require("path");
const sinon = require("sinon");
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");
const { Etablissement } = require("../../../common/model/index");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { performUpdates } = require("../updater/updater.js");
const catalogue = require("../../../common/components/catalogue");

const EtablissementsTest = fs.readJsonSync(path.resolve(__dirname, "../assets/sample.json"));

describe(__filename, () => {
  before(async () => {
    // Connection to test collection
    await connectToMongoForTests();
    await Etablissement.deleteMany({});

    // insert sample data in DB
    await asyncForEach(EtablissementsTest, async (etablissement) => await new Etablissement(etablissement).save());

    // mocks
    sinon
      .stub(catalogue, "etablissementService")
      .returns(Promise.resolve({ updates: { published: true }, etablissement: { published: true }, error: null }));
  });

  after(async () => {
    await cleanAll();
    // clean mocks
    sinon.restore();
  });

  it("should have inserted sample data", async () => {
    const count = await Etablissement.countDocuments({});
    assert.strictEqual(count, 1);
  });

  it("should have updated data with etablissement service call", async () => {
    await performUpdates({}, {});

    const etablissement = await Etablissement.findById("5fd2551ee7630d000905875e");
    // console.log(etablissement);
    assert.strictEqual(etablissement.published, true);
    const count = await Etablissement.countDocuments({});
    assert.strictEqual(count, 1);
  });
});
