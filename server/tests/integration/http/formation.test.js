const assert = require("assert");
const httpTests = require("../../utils/httpTests");
const { Formation, User } = require("../../../src/common/models");
const { setupBeforeAll } = require("../../helpers/setup");
const { connectToMongoForTests } = require("../../utils/testUtils");

httpTests(__filename, ({ startServer }) => {
  before(async () => {
    setupBeforeAll();
    await Formation.deleteMany({});
    await User.deleteMany({});
  });

  it("Should return a 401 if not logged in", async () => {
    const { httpClient } = await startServer();

    await new Formation({
      cfd: "123456789",
    }).save();
    await new Formation({
      cfd: "12345678",
    }).save();
    await new Formation({
      cfd: "1234567",
    }).save();

    const response = await httpClient.get("/api/entity/formations.json?limit=2");

    assert.strictEqual(response.status, 401);
  });

  it("Should get formations list in json format if logged in", async () => {
    const { httpClient, createAndLogUser } = await startServer();

    await new Formation({
      cfd: "123456789",
    }).save();
    await new Formation({
      cfd: "12345678",
    }).save();
    await new Formation({
      cfd: "1234567",
    }).save();

    await createAndLogUser("user", "password", { permissions: { isAdmin: true } });

    const response = await httpClient.get("/api/entity/formations.json?limit=2");

    assert.strictEqual(response.status, 200);
    const formations = response.data;
    assert.strictEqual(formations.length, 2);
    assert.deepStrictEqual(formations[0].cfd, "123456789");
  });
});
