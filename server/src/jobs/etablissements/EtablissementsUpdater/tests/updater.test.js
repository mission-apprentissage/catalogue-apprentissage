const sinon = require("sinon");
const assert = require("assert");
const fs = require("fs-extra");
const path = require("path");
const { connectToMongoForTests, cleanAll } = require("../../../../../tests/utils/testUtils.js");
const { Etablissement } = require("../../../../common/model/index");
const { asyncForEach } = require("../../../../common/utils/asyncUtils");
const rewiremock = require("rewiremock/node");
const apiUtils = require("../../../../common/utils/apiUtils");

const EtablissementsTest = fs.readJsonSync(path.resolve(__dirname, "../assets/sample.json"));

describe(__filename, () => {
  let isApiEntrepriseUpStub;

  before(async () => {
    // Connection to test collection
    await connectToMongoForTests();
    await Etablissement.deleteMany({});

    // insert sample data in DB
    await asyncForEach(EtablissementsTest, async (etablissement) => await new Etablissement(etablissement).save());
  });

  after(async () => {
    await cleanAll();
  });

  beforeEach(function () {
    isApiEntrepriseUpStub = sinon.stub(apiUtils, "isApiEntrepriseUp");
  });

  afterEach(function () {
    isApiEntrepriseUpStub.restore();
  });

  it("should have inserted sample data", async () => {
    const count = await Etablissement.countDocuments({});
    assert.strictEqual(count, 1);
  });

  it("should have updated data with etablissement service call", async () => {
    rewiremock("@mission-apprentissage/tco-service-node").with({
      getEtablissementUpdates: () => ({
        updates: { published: true },
        etablissement: { published: true },
        error: null,
      }),
    });

    isApiEntrepriseUpStub.returns(Promise.resolve(true));

    rewiremock("../../../../common/utils/apiUtils").with({
      isApiEntrepriseUp: isApiEntrepriseUpStub,
    });

    const { performUpdates } = require("../updater/updater.js");

    await performUpdates({}, {});

    assert.equal(isApiEntrepriseUpStub.calledOnce, true);

    const etablissement = await Etablissement.findById("5fd2551ee7630d000905875e");
    // console.log(etablissement);
    assert.strictEqual(etablissement.published, true);
    const count = await Etablissement.countDocuments({});
    assert.strictEqual(count, 1);
  });
});