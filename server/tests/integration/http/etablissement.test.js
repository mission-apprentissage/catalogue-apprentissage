const { ok, strictEqual, deepStrictEqual } = require("assert");
const httpTests = require("../../utils/httpTests");
const { insertEtablissement } = require("../../utils/fixtures");
const { setupBeforeAll } = require("../../helpers/setup");

httpTests(__filename, ({ startServer }) => {
  before(async () => {
    setupBeforeAll();
  });

  it("Should return a 401 if not logged in", async () => {
    const { httpClient } = await startServer();

    const response = await httpClient.get("/api/entity/etablissements");

    strictEqual(response.status, 401);
  });

  it("Vérifie qu'on peut lister des établissements", async () => {
    const { httpClient, createAndLogUser } = await startServer();
    await insertEtablissement({
      uai: "0010856A",
    });

    await createAndLogUser("user", "password", { permissions: { isAdmin: true } });

    const response = await httpClient.get("/api/entity/etablissements");

    strictEqual(response.status, 200);
    let etablissements = response.data.etablissements;

    ok(etablissements);
    deepStrictEqual(etablissements[0].uai, "0010856A");
  });

  it("Vérifie qu'on peut lister des établissements avec de la pagination", async () => {
    const { httpClient, createAndLogUser } = await startServer();
    await insertEtablissement({
      uai: "0010856A",
    });
    await insertEtablissement({
      uai: "0551031X",
    });

    await createAndLogUser("user", "password", { permissions: { isAdmin: true } });

    const response = await httpClient.get("/api/entity/etablissements?page=1&limit=1");

    strictEqual(response.status, 200);
    let etablissements = response.data.etablissements;
    ok(etablissements);
    strictEqual(etablissements.length, 1);
    deepStrictEqual(etablissements[0].uai, "0010856A");
  });

  it("Vérifie qu'on peut filtre les établissements avec une query", async () => {
    const { httpClient, createAndLogUser } = await startServer();
    await insertEtablissement({
      uai: "0010856A",
    });
    await insertEtablissement({
      uai: "0551031X",
    });

    await createAndLogUser("user", "password", { permissions: { isAdmin: true } });

    const response = await httpClient.get(`/api/entity/etablissements?query={"uai":"0010856A"}`);

    strictEqual(response.status, 200);
    let etablissements = response.data.etablissements;
    ok(etablissements);
    strictEqual(etablissements.length, 1);
    deepStrictEqual(etablissements[0].uai, "0010856A");
  });

  it("Vérifie qu'on peut lister des établissements en json", async () => {
    const { httpClient, createAndLogUser } = await startServer();
    await insertEtablissement({
      uai: "0010856A",
    });
    await insertEtablissement({
      uai: "0751111A",
    });
    await insertEtablissement({
      uai: "0751234J",
    });

    await createAndLogUser("user", "password", { permissions: { isAdmin: true } });

    const response = await httpClient.get("/api/entity/etablissements.json?limit=2");

    strictEqual(response.status, 200);
    const etablissements = response.data;
    strictEqual(etablissements.length, 2);
    deepStrictEqual(etablissements[0].uai, "0010856A");
  });
});
