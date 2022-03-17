const assert = require("assert");
const rewiremock = require("rewiremock/node");

describe(__filename, () => {
  it("should return an error if called without arguments", async () => {
    const { geoMapper } = require("../../../../src/logic/mappers/geoMapper");

    const expected = {
      result: null,
      messages: {
        error: "Unable to retrieve data without coordinates",
      },
    };

    const result = await geoMapper();
    assert.deepStrictEqual(result, expected);
  });

  it("should return error if coordinates are not found", async () => {
    rewiremock("@mission-apprentissage/tco-service-node").with({
      getAddressFromCoordinates: () => ({}),
    });

    const { geoMapper } = require("../../../../src/logic/mappers/geoMapper");

    const expected = {
      result: null,
      messages: {
        error: `Unable to retrieve data from coordinates 48.85053461447283, 2.3083430674498158 `,
      },
    };

    const { result, messages } = await geoMapper("48.85053461447283, 2.3083430674498158");
    assert.deepStrictEqual(messages.error, expected.messages.error);
    assert.deepStrictEqual(result, expected.result);
  });

  it("should return error if coordinates has an error", async () => {
    rewiremock("@mission-apprentissage/tco-service-node").with({
      getAddressFromCoordinates: () => ({ messages: { error: "nope" } }),
    });

    const { geoMapper } = require("../../../../src/logic/mappers/geoMapper");

    const expected = {
      result: null,
      messages: {
        error: `Unable to retrieve data from coordinates 48.85053461447283, 2.3083430674498158 nope`,
      },
    };

    const { result, messages } = await geoMapper("48.85053461447283, 2.3083430674498158");
    assert.deepStrictEqual(messages.error, expected.messages.error);
    assert.deepStrictEqual(result, expected.result);
  });

  it("should return error if insee provided is inconsistent with result", async () => {
    const { geoMapper } = require("../../../../src/logic/mappers/geoMapper");

    const expected = {
      messages: {
        error: `geoMapper code Insee inconsistent results : original code 93100, code given by api adresse 31069`,
      },
    };

    const { messages } = await geoMapper("48.85053461447283, 2.3083430674498158", "93100");
    assert.deepStrictEqual(messages.error, expected.messages.error);
  });

  it("should return result if coordinates provided", async () => {
    const { geoMapper } = require("../../../../src/logic/mappers/geoMapper");

    const expected = {
      result: {
        adresse: "Avenue Georges Brassens",
        code_commune_insee: "31069",
        code_postal: "31700",
        localite: "Blagnac",
        nom_academie: "Toulouse",
        nom_departement: "Haute-Garonne",
        num_academie: "16",
        num_departement: "31",
        region: "Occitanie",
      },
    };

    const { result } = await geoMapper("48.85053461447283, 2.3083430674498158", "31069");
    assert.deepStrictEqual(result, expected.result);
  });
});
