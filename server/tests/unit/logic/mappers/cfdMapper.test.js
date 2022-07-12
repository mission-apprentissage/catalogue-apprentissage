const assert = require("assert");
const rewiremock = require("rewiremock/node");

describe(__filename, () => {
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
      getCfdInfo: () => ({ result: { rncp: { romes: false } }, messages: {} }),
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

  it("should compute cfd entree ", () => {
    const { getCfdEntree } = require("../../../../src/logic/mappers/cfdMapper");

    // get cfd entree is different for some listed cfd
    assert.strictEqual(getCfdEntree("32033423"), "32033422");
    assert.strictEqual(getCfdEntree("32033425"), "32033422");
    assert.strictEqual(getCfdEntree("32033604"), "32033606");
    assert.strictEqual(getCfdEntree("32022312"), "32022310");

    // else it is the same
    assert.strictEqual(getCfdEntree("32022388"), "32022388");
    assert.strictEqual(getCfdEntree("32022399"), "32022399");
    assert.strictEqual(getCfdEntree("38123376"), "38123376");
  });
});
