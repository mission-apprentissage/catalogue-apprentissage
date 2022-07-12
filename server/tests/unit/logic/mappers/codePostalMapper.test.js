const assert = require("assert");
const rewiremock = require("rewiremock/node");

describe(__filename, () => {
  it("should return an error if called without arguments", async () => {
    const { codePostalMapper } = require("../../../../src/logic/mappers/codePostalMapper");

    const expected = {
      result: null,
      messages: {
        error: "Error: codePostalMapper codePostal must be provided",
      },
    };

    const result = await codePostalMapper();
    assert.deepStrictEqual(result, expected);
  });

  it("should return error if cp is not found", async () => {
    rewiremock("@mission-apprentissage/tco-service-node").with({
      getCpInfo: () => null,
    });

    const { codePostalMapper } = require("../../../../src/logic/mappers/codePostalMapper");

    const expected = {
      result: null,
      messages: {
        error: `Error: Unable to retrieve data from codePostal 999999 `,
      },
    };

    const { result, messages } = await codePostalMapper("999999");
    assert.deepStrictEqual(messages.error, expected.messages.error);
    assert.deepStrictEqual(result, expected.result);
  });

  it("should return error and log insee if cp is not found", async () => {
    rewiremock("@mission-apprentissage/tco-service-node").with({
      getCpInfo: () => null,
    });

    const { codePostalMapper } = require("../../../../src/logic/mappers/codePostalMapper");

    const expected = {
      result: null,
      messages: {
        error: `Error: Unable to retrieve data from codePostal 999999 (88888) `,
      },
    };

    const { result, messages } = await codePostalMapper("999999", "88888");
    assert.deepStrictEqual(messages.error, expected.messages.error);
    assert.deepStrictEqual(result, expected.result);
  });

  it("should return error if cp has an error", async () => {
    rewiremock("@mission-apprentissage/tco-service-node").with({
      getCpInfo: () => ({ messages: { error: "nope" } }),
    });

    const { codePostalMapper } = require("../../../../src/logic/mappers/codePostalMapper");

    const expected = {
      result: null,
      messages: {
        error: `Error: Unable to retrieve data from codePostal 999999 nope`,
      },
    };

    const { result, messages } = await codePostalMapper("999999");
    assert.deepStrictEqual(messages.error, expected.messages.error);
    assert.deepStrictEqual(result, expected.result);
  });

  it("should return error if cp or insee provided is inconsistent with result", async () => {
    const { codePostalMapper } = require("../../../../src/logic/mappers/codePostalMapper");

    const expected = {
      result: null,
      messages: {
        error: `Error: codePostalMapper codePostal inconsistent results : original code 93100, code given by api adresse 92600 (92004)`,
      },
    };

    const { result, messages } = await codePostalMapper("93100");
    assert.deepStrictEqual(messages.error, expected.messages.error);
    assert.deepStrictEqual(result, expected.result);
  });

  it("should return error & log insee if cp or insee provided is inconsistent with result", async () => {
    const { codePostalMapper } = require("../../../../src/logic/mappers/codePostalMapper");

    const expected = {
      result: null,
      messages: {
        error: `Error: codePostalMapper codePostal inconsistent results : original code 93100 (93048), code given by api adresse 92600 (92004)`,
      },
    };

    const { result, messages } = await codePostalMapper("93100", "93048");
    assert.deepStrictEqual(messages.error, expected.messages.error);
    assert.deepStrictEqual(result, expected.result);
  });

  it("should return result if cp provided", async () => {
    const { codePostalMapper } = require("../../../../src/logic/mappers/codePostalMapper");

    const expected = {
      result: {
        code_commune_insee: "92004",
        code_postal: "92600",
        localite: "Asnières-sur-Seine",
        nom_academie: "Versailles",
        nom_departement: "Hauts-de-Seine",
        num_academie: "25",
        num_departement: "92",
        region: "Île-de-France",
      },
    };

    const { result } = await codePostalMapper("92600");
    assert.deepStrictEqual(result, expected.result);
  });
});
