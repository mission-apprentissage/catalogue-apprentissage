const { ok, strictEqual, deepStrictEqual } = require("assert");
const httpTests = require("../../utils/httpTests");
const { insertEtablissement } = require("../../utils/fixtures");

httpTests(__filename, ({ startServer }) => {
  it("Vérifie qu'on peut lister des établissements", async () => {
    const { httpClient } = await startServer();
    await insertEtablissement({
      uai: "0010856A",
    });

    const response = await httpClient.get("/api/v1/entity/etablissements");

    strictEqual(response.status, 200);
    let etablissements = response.data.etablissements;
    ok(etablissements);
    deepStrictEqual(etablissements[0].uai, "0010856A");
  });

  it("Vérifie qu'on peut lister des établissements avec de la pagination", async () => {
    const { httpClient } = await startServer();
    await insertEtablissement({
      uai: "0010856A",
    });
    await insertEtablissement({
      uai: "0010856X",
    });

    const response = await httpClient.get("/api/v1/entity/etablissements?page=1&limit=1");

    strictEqual(response.status, 200);
    let etablissements = response.data.etablissements;
    ok(etablissements);
    strictEqual(etablissements.length, 1);
    deepStrictEqual(etablissements[0].uai, "0010856A");
  });

  it("Vérifie qu'on peut filtre les établissements avec une query", async () => {
    const { httpClient } = await startServer();
    await insertEtablissement({
      uai: "0010856A",
    });
    await insertEtablissement({
      uai: "0010856X",
    });

    const response = await httpClient.get(`/api/v1/entity/etablissements?query={"uai":"0010856A"}`);

    strictEqual(response.status, 200);
    let etablissements = response.data.etablissements;
    ok(etablissements);
    strictEqual(etablissements.length, 1);
    deepStrictEqual(etablissements[0].uai, "0010856A");
  });

  it("Vérifie qu'on peut lister des établissements en ndjson", async () => {
    const { httpClient } = await startServer();
    await insertEtablissement({
      uai: "0010856A",
    });
    await insertEtablissement({
      uai: "0751111A",
    });
    await insertEtablissement({
      uai: "0751234J",
    });

    const response = await httpClient.get("/api/v1/entity/etablissements.ndjson?limit=2");

    strictEqual(response.status, 200);
    let etablissements = response.data.split("\n").filter((e) => e);
    strictEqual(etablissements.length, 2);
    deepStrictEqual(JSON.parse(etablissements[0]).uai, "0010856A");
  });
});
