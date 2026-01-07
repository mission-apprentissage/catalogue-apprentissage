const assert = require("assert");
const httpTests = require("../../utils/httpTests");
const config = require("config");
const { setupBeforeAll } = require("../../helpers/setup");

httpTests(__filename, ({ startServer }) => {
  before(async () => {
    setupBeforeAll();
  });

  it("Vérifie que le server fonctionne", async () => {
    const { httpClient } = await startServer();

    const response = await httpClient.get("/api");

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.name, `Serveur Express Catalogue - ${config.appName}`);
    assert.strictEqual(response.data.healthcheck.mongodb, true);
    assert.ok(response.data.env);
    assert.ok(response.data.version);
  });
});
