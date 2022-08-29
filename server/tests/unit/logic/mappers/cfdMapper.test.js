const assert = require("assert");
const rewiremock = require("rewiremock/node");
const csvToJson = require("convert-csv-to-json");

describe(__filename, () => {
  it("should load cfd-entree-sortie data ", () => {
    const { loadCfdEntreeSortieMap } = require("../../../../src/logic/mappers/cfdMapper");

    const csvString = `cfd;cfd_entree;cfd_sortie
32033422;32033422;32033425
32033423;32033422;32033425
32033424;32033422;32033425
32033425;32033422;32033425
32022316;32022316;32022318
32022317;32022316;32022318
32022318;32022316;32022318
32032209;32032209;32032211
32032210;32032209;32032211
32032211;32032209;32032211
32033606;32033606;32033605
32033603;32033606;32033605
32033604;32033606;32033605
32033605;32033606;32033605
32032612;32032612;32032614
32032613;32032612;32032614
32032614;32032612;32032614
32022310;32022310;32022312
32022310;32022310;32022312
32022312;32022310;32022312`;
    const jsonData = csvToJson.csvStringToJson(csvString);
    const cfdEntreeSortieMap = loadCfdEntreeSortieMap(jsonData);

    assert.deepStrictEqual(cfdEntreeSortieMap, {
      "32022310": { cfd_entree: "32022310", cfd_sortie: "32022312" },
      "32022312": { cfd_entree: "32022310", cfd_sortie: "32022312" },
      "32022316": { cfd_entree: "32022316", cfd_sortie: "32022318" },
      "32022317": { cfd_entree: "32022316", cfd_sortie: "32022318" },
      "32022318": { cfd_entree: "32022316", cfd_sortie: "32022318" },
      "32032209": { cfd_entree: "32032209", cfd_sortie: "32032211" },
      "32032210": { cfd_entree: "32032209", cfd_sortie: "32032211" },
      "32032211": { cfd_entree: "32032209", cfd_sortie: "32032211" },
      "32032612": { cfd_entree: "32032612", cfd_sortie: "32032614" },
      "32032613": { cfd_entree: "32032612", cfd_sortie: "32032614" },
      "32032614": { cfd_entree: "32032612", cfd_sortie: "32032614" },
      "32033422": { cfd_entree: "32033422", cfd_sortie: "32033425" },
      "32033423": { cfd_entree: "32033422", cfd_sortie: "32033425" },
      "32033424": { cfd_entree: "32033422", cfd_sortie: "32033425" },
      "32033425": { cfd_entree: "32033422", cfd_sortie: "32033425" },
      "32033603": { cfd_entree: "32033606", cfd_sortie: "32033605" },
      "32033604": { cfd_entree: "32033606", cfd_sortie: "32033605" },
      "32033605": { cfd_entree: "32033606", cfd_sortie: "32033605" },
      "32033606": { cfd_entree: "32033606", cfd_sortie: "32033605" },
    });
  });

  it("should return an error if called without arguments", async () => {
    const { cfdMapper } = require("../../../../src/logic/mappers/cfdMapper");

    const expected = {
      result: null,
      messages: {
        error: "Error: cfdMapper cfd must be provided",
      },
    };

    const result = await cfdMapper();
    assert.deepStrictEqual(result, expected);
  });

  it("should return error if cfd is not found", async () => {
    rewiremock("@mission-apprentissage/tco-service-node").with({
      getCfdInfo: () => null,
    });

    const { cfdMapper } = require("../../../../src/logic/mappers/cfdMapper");

    const expected = {
      result: null,
      messages: {
        error: `Error: Unable to retrieve data from cfd test`,
      },
    };

    const { result, messages } = await cfdMapper("test");
    assert.deepStrictEqual(messages.error, expected.messages.error);
    assert.deepStrictEqual(result, expected.result);
  });

  it("should set default values if cfd result is empty", async () => {
    rewiremock("@mission-apprentissage/tco-service-node").with({
      getCfdInfo: () => ({ result: {}, messages: {} }),
    });

    const { cfdMapper } = require("../../../../src/logic/mappers/cfdMapper");

    const expected = {
      result: {
        cfd: undefined,
        diplome: undefined,
        rncp_details: {
          code_type_certif: null,
        },
      },
      messages: {},
    };

    const { result, messages } = await cfdMapper("test");
    assert.deepStrictEqual(messages, expected.messages);
    assert.deepStrictEqual(result.cfd, expected.result.cfd);
    assert.deepStrictEqual(result.diplome, expected.result.diplome);
    assert.deepStrictEqual(result.rncp_details.code_type_certif, expected.result.rncp_details.code_type_certif);
  });

  it("should ensure romes are an array", async () => {
    rewiremock("@mission-apprentissage/tco-service-node").with({
      getCfdInfo: () => ({ result: { rncps: [{ romes: false }] }, messages: {} }),
    });

    const { cfdMapper } = require("../../../../src/logic/mappers/cfdMapper");

    const expected = {
      result: {
        rome_codes: [],
      },
    };

    const { result } = await cfdMapper("test");
    assert.deepStrictEqual(result.rome_codes, expected.result.rome_codes);
  });

  it("should return result if cfd provided", async () => {
    const { cfdMapper } = require("../../../../src/logic/mappers/cfdMapper");

    const expected = {
      messages: {
        cfd: "Trouvé dans la BCN",
      },
      result: {
        cfd: "40033002",
        diplome: "BAC PROFESSIONNEL",
        rncp_details: {
          code_type_certif: "BAC PRO",
        },
      },
    };

    const { result, messages } = await cfdMapper("test");

    assert.deepStrictEqual(messages.cfd, expected.messages.cfd);
    assert.deepStrictEqual(result.cfd, expected.result.cfd);
    assert.deepStrictEqual(result.diplome, expected.result.diplome);
    assert.deepStrictEqual(result.rncp_details.code_type_certif, expected.result.rncp_details.code_type_certif);
  });

  it("should compute cfd entree / sortie ", () => {
    const { getCfdEntree, getCfdSortie, loadCfdEntreeSortieMap } = require("../../../../src/logic/mappers/cfdMapper");

    const csvString = `cfd;cfd_entree;cfd_sortie
32033422;32033422;32033425
32033423;32033422;32033425
32033424;32033422;32033425
32033425;32033422;32033425
32022316;32022316;32022318
32022317;32022316;32022318
32022318;32022316;32022318
32032209;32032209;32032211
32032210;32032209;32032211
32032211;32032209;32032211
32033606;32033606;32033605
32033603;32033606;32033605
32033604;32033606;32033605
32033605;32033606;32033605
32032612;32032612;32032614
32032613;32032612;32032614
32032614;32032612;32032614
32022310;32022310;32022312
32022310;32022310;32022312
32022312;32022310;32022312`;
    const jsonData = csvToJson.csvStringToJson(csvString);
    loadCfdEntreeSortieMap(jsonData);

    // get cfd entree is different for some listed cfd
    assert.strictEqual(getCfdEntree("32033423"), "32033422");
    assert.strictEqual(getCfdEntree("32033425"), "32033422");
    assert.strictEqual(getCfdEntree("32033604"), "32033606");
    assert.strictEqual(getCfdEntree("32022312"), "32022310");

    // else it is the same
    assert.strictEqual(getCfdEntree("32022388"), "32022388");
    assert.strictEqual(getCfdEntree("32022399"), "32022399");
    assert.strictEqual(getCfdEntree("38123376"), "38123376");

    // get cfd sortie is different for some listed cfd
    assert.strictEqual(getCfdSortie("32033422"), "32033425");
    assert.strictEqual(getCfdSortie("32022316"), "32022318");
    assert.strictEqual(getCfdSortie("32032209"), "32032211");
    assert.strictEqual(getCfdSortie("32032612"), "32032614");

    // else it is the same
    assert.strictEqual(getCfdSortie("32033425"), "32033425");
    assert.strictEqual(getCfdSortie("32033605"), "32033605");
    assert.strictEqual(getCfdSortie("32032211"), "32032211");
  });
});
