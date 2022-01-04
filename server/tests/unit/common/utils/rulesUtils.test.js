const assert = require("assert");
const {
  getCfdExpireRule,
  getQueryFromRule,
  serialize,
  deserialize,
} = require("../../../../src/common/utils/rulesUtils");

describe(__filename, () => {
  describe("getCfdExpireRule", () => {
    it("should expire rule on 31/08 of current year if before 01/10", () => {
      const expected = {
        $or: [
          {
            cfd_date_fermeture: {
              $gt: new Date(`2021-08-31T00:00:00.000Z`),
            },
          },
          { cfd_date_fermeture: null },
        ],
      };

      let result = getCfdExpireRule(1, new Date(`2021-05-01T00:00:00.000Z`));
      assert.deepStrictEqual(result, expected);
    });

    it("should expire rule on 31/08 of next year if equal 01/10", () => {
      const expected = {
        $or: [
          {
            cfd_date_fermeture: {
              $gt: new Date(`2022-08-31T00:00:00.000Z`),
            },
          },
          { cfd_date_fermeture: null },
        ],
      };

      let result = getCfdExpireRule(1, new Date(`2021-10-01T00:00:00.000Z`));
      assert.deepStrictEqual(result, expected);
    });

    it("should expire rule on 31/08 of next year if after 01/10", () => {
      const expected = {
        $or: [
          {
            cfd_date_fermeture: {
              $gt: new Date(`2022-08-31T00:00:00.000Z`),
            },
          },
          { cfd_date_fermeture: null },
        ],
      };

      let result = getCfdExpireRule(1, new Date(`2021-11-01T00:00:00.000Z`));
      assert.deepStrictEqual(result, expected);
    });
  });

  describe("getQueryFromRule", () => {
    it("should build a query from a simple rule", () => {
      const expected = {
        $and: [
          {
            $or: [
              {
                "rncp_details.active_inactive": "ACTIVE",
                "rncp_details.code_type_certif": {
                  $in: ["Titre", "TP"],
                },
              },
              {
                "rncp_details.code_type_certif": {
                  $nin: ["Titre", "TP"],
                },
              },
            ],
          },
        ],
        annee: {
          $ne: "X",
        },
        cfd_outdated: {
          $ne: true,
        },
        diplome: "BTS",
        etablissement_gestionnaire_catalogue_published: true,
        etablissement_reference_catalogue_published: true,
        niveau: "4",
        num_academie: "10",
        published: true,
      };

      let result = getQueryFromRule({ plateforme: "affelnet", niveau: "4", diplome: "BTS", num_academie: "10" });
      assert.deepStrictEqual(result, expected);
    });
  });

  describe("serialize", () => {
    it("should serialize an object", () => {
      let expected = '{"niveau":"4","diplome":"BTS","num_academie":"10"}';
      let result = serialize({ niveau: "4", diplome: "BTS", num_academie: "10" });
      assert.deepStrictEqual(result, expected);

      expected = '{"$and":[{"bcn_mefs_10.mef10":{"$regex":"31$"}},{"bcn_mefs_10.mef10":{"$regex":"^242"}}]}';
      result = serialize({
        $and: [{ "bcn_mefs_10.mef10": { $regex: /31$/ } }, { "bcn_mefs_10.mef10": { $regex: /^242/ } }],
      });
      assert.deepStrictEqual(result, expected);
    });
  });

  describe("deserialize", () => {
    it("should deserialize a string", () => {
      let expected = { niveau: "4", diplome: "BTS", num_academie: "10" };
      let result = deserialize('{"niveau":"4","diplome":"BTS","num_academie":"10"}');
      assert.deepStrictEqual(result, expected);

      expected = { $and: [{ "bcn_mefs_10.mef10": { $regex: /31$/ } }, { "bcn_mefs_10.mef10": { $regex: /^242/ } }] };
      result = deserialize('{"$and":[{"bcn_mefs_10.mef10":{"$regex":"31$"}},{"bcn_mefs_10.mef10":{"$regex":"^242"}}]}');
      assert.deepStrictEqual(result, expected);
    });
  });
});
