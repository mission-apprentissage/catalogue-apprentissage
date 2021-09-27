const assert = require("assert");
const httpTests = require("../../utils/httpTests");
const { MnaFormation } = require("../../../src/common/model");

httpTests(__filename, ({ startServer }) => {
  before(async () => {
    await MnaFormation.deleteMany({});
  });

  it("Should get formations list in ndjson format", async () => {
    const { httpClient } = await startServer();
    await new MnaFormation({
      cfd: "123456789",
    }).save();
    await new MnaFormation({
      cfd: "12345678",
    }).save();
    await new MnaFormation({
      cfd: "1234567",
    }).save();

    const response = await httpClient.get("/api/v1/entity/formations.ndjson?limit=2");

    assert.strictEqual(response.status, 200);
    let formations = response.data.split("\n").filter((e) => e);
    assert.strictEqual(formations.length, 2);
    assert.deepStrictEqual(JSON.parse(formations[0]).cfd, "123456789");
  });
});
