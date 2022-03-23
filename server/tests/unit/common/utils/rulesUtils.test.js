const assert = require("assert");
const {
  getExpireRule,
  getQueryFromRule,
  serialize,
  deserialize,
  getPeriodeStartDate,
} = require("../../../../src/common/utils/rulesUtils");

describe(__filename, () => {
  describe("getExpireRule", () => {
    it("should expire rule on 31/08 of current year if before 01/10", () => {
      const thresholdDate = new Date(`2021-08-31T00:00:00.000Z`);
      const expected = {
        $or: [
          {
            "rncp_details.code_type_certif": {
              $nin: ["Titre", "TP"],
            },
            $or: [
              {
                cfd_date_fermeture: {
                  $gt: thresholdDate,
                },
              },
              { cfd_date_fermeture: null },
            ],
          },
          {
            "rncp_details.code_type_certif": {
              $in: ["Titre", "TP"],
            },
            $or: [
              {
                "rncp_details.date_fin_validite_enregistrement": {
                  $gt: thresholdDate,
                },
              },
              { "rncp_details.date_fin_validite_enregistrement": null },
            ],
          },
        ],
      };

      let result = getExpireRule(new Date(`2021-05-01T00:00:00.000Z`));
      assert.deepStrictEqual(result, expected);
    });

    it("should expire rule on 31/08 of next year if equal 01/10", () => {
      const thresholdDate = new Date(`2022-08-31T00:00:00.000Z`);
      const expected = {
        $or: [
          {
            "rncp_details.code_type_certif": {
              $nin: ["Titre", "TP"],
            },
            $or: [
              {
                cfd_date_fermeture: {
                  $gt: thresholdDate,
                },
              },
              { cfd_date_fermeture: null },
            ],
          },
          {
            "rncp_details.code_type_certif": {
              $in: ["Titre", "TP"],
            },
            $or: [
              {
                "rncp_details.date_fin_validite_enregistrement": {
                  $gt: thresholdDate,
                },
              },
              { "rncp_details.date_fin_validite_enregistrement": null },
            ],
          },
        ],
      };

      let result = getExpireRule(new Date(`2021-10-01T00:00:00.000Z`));
      assert.deepStrictEqual(result, expected);
    });

    it("should expire rule on 31/08 of next year if after 01/10", () => {
      const thresholdDate = new Date(`2022-08-31T00:00:00.000Z`);
      const expected = {
        $or: [
          {
            "rncp_details.code_type_certif": {
              $nin: ["Titre", "TP"],
            },
            $or: [
              {
                cfd_date_fermeture: {
                  $gt: thresholdDate,
                },
              },
              { cfd_date_fermeture: null },
            ],
          },
          {
            "rncp_details.code_type_certif": {
              $in: ["Titre", "TP"],
            },
            $or: [
              {
                "rncp_details.date_fin_validite_enregistrement": {
                  $gt: thresholdDate,
                },
              },
              { "rncp_details.date_fin_validite_enregistrement": null },
            ],
          },
        ],
      };

      let result = getExpireRule(new Date(`2021-11-01T00:00:00.000Z`));
      assert.deepStrictEqual(result, expected);
    });
  });

  describe("getPeriodeStartDate", () => {
    it("should get september of the same year if now is before september", () => {
      const expected = new Date(`2022-09-01T00:00:00.000Z`);

      let result = getPeriodeStartDate(new Date(`2022-03-01T00:00:00.000Z`));
      assert.deepStrictEqual(result, expected);

      result = getPeriodeStartDate(new Date(`2022-08-11T00:00:00.000Z`));
      assert.deepStrictEqual(result, expected);
    });

    it("should get september of the next year if now is after september", () => {
      const expected = new Date(`2023-09-01T00:00:00.000Z`);

      let result = getPeriodeStartDate(new Date(`2022-09-01T00:00:00.000Z`));
      assert.deepStrictEqual(result, expected);

      result = getPeriodeStartDate(new Date(`2022-10-01T00:00:00.000Z`));
      assert.deepStrictEqual(result, expected);
    });
  });

  describe("getQueryFromRule", () => {
    it("should build a query from a simple rule", () => {
      const expected = {
        $and: [
          {
            $and: [
              {
                annee: {
                  $ne: "X",
                },
                $or: [
                  {
                    "rncp_details.code_type_certif": {
                      $in: ["Titre", "TP"],
                    },
                    "rncp_details.rncp_outdated": { $ne: true },
                  },
                  {
                    "rncp_details.code_type_certif": {
                      $nin: ["Titre", "TP"],
                    },
                    cfd_outdated: { $ne: true },
                  },
                ],
                etablissement_gestionnaire_catalogue_published: true,
                etablissement_reference_catalogue_published: true,
                published: true,
                // periode: { $gte: getPeriodeStartDate() },
              },
            ],
          },
          {
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
          },
          { $and: [{ rncp_code: "RNCP34825" }] },
        ],
        diplome: "BTS",
        niveau: "4",
        num_academie: "10",
        ...getExpireRule(),
      };

      let result = getQueryFromRule({
        plateforme: "affelnet",
        niveau: "4",
        diplome: "BTS",
        num_academie: "10",
        regle_complementaire: serialize({ $and: [{ rncp_code: "RNCP34825" }] }),
      });
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
