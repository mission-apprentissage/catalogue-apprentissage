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
        error: `Unable to retrieve data from cfd test`,
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

  it("should handle opcos data", async () => {
    rewiremock("@mission-apprentissage/tco-service-node").with({
      getCfdInfo: () => ({ result: { opcos: [{ operateur_de_competences: "test-opco" }] }, messages: {} }),
    });

    const { cfdMapper } = require("../../../../src/logic/mappers/cfdMapper");

    const expected = {
      result: {
        opcos: ["test-opco"],
        info_opcos: 1,
        info_opcos_intitule: "Trouvés",
      },
    };

    const { result } = await cfdMapper("test");
    assert.deepStrictEqual(result.opcos, expected.result.opcos);
    assert.deepStrictEqual(result.info_opcos, expected.result.info_opcos);
    assert.deepStrictEqual(result.info_opcos_intitule, expected.result.info_opcos_intitule);
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
});