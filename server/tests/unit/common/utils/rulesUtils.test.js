const assert = require("assert");
const {
  getExpireRule,
  getQueryFromRule,
  serialize,
  deserialize,
  getExpirationDate,
  getSessionStartDate,
  getSessionEndDate,
} = require("../../../../src/common/utils/rulesUtils");
const { CampagneStart } = require("../../../../src/common/models");
const { setupBeforeAll } = require("../../../helpers/setup");
const { connectToMongoForTests } = require("../../../utils/testUtils");

describe(__filename, () => {
  before(async () => {
    setupBeforeAll();
    await connectToMongoForTests();
  });

  describe("getExpirationDate", () => {
    it("should give the 31/08 of current year if before 01/10", () => {
      const expected = new Date(`2021-08-31T23:59:59.999Z`);
      let result = getExpirationDate(new Date(`2021-05-01T00:00:00.000Z`));

      assert.deepStrictEqual(result, expected);
    });

    it("should give the 31/08 of next year if after 01/10", () => {
      const expected = new Date(`2022-08-31T23:59:59.999Z`);
      let result = getExpirationDate(new Date(`2021-10-01T00:00:00.000Z`));

      assert.deepStrictEqual(result, expected);
    });
  });

  describe("getExpireRule", () => {
    it("should expire rule on 31/08 of current year if before 01/10", () => {
      const thresholdDate = new Date(`2021-08-31T23:59:59.999Z`);
      const expected = {
        $or: [
          {
            CI_inscrit_rncp: {
              $eq: "3 - Inscrit de droit",
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
            CI_inscrit_rncp: {
              $ne: "3 - Inscrit de droit",
            },
            rncp_code: { $exists: true, $ne: null },
            $or: [
              {
                "rncp_details.date_fin_validite_enregistrement": {
                  $gt: thresholdDate,
                },
              },
              { "rncp_details.date_fin_validite_enregistrement": null },
            ],
          },
          {
            CI_inscrit_rncp: {
              $ne: "3 - Inscrit de droit",
            },
            rncp_code: { $eq: null },
            $or: [
              {
                cfd_date_fermeture: {
                  $gt: thresholdDate,
                },
              },
              { cfd_date_fermeture: null },
            ],
          },
        ],
      };

      let result = getExpireRule(new Date(`2021-05-01T00:00:00.000Z`));
      assert.deepStrictEqual(result, expected);
    });

    it("should expire rule on 31/08 of next year if equal 01/10", () => {
      const thresholdDate = new Date(`2022-08-31T23:59:59.999Z`);
      const expected = {
        $or: [
          {
            CI_inscrit_rncp: {
              $eq: "3 - Inscrit de droit",
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
            CI_inscrit_rncp: {
              $ne: "3 - Inscrit de droit",
            },
            rncp_code: { $exists: true, $ne: null },
            $or: [
              {
                "rncp_details.date_fin_validite_enregistrement": {
                  $gt: thresholdDate,
                },
              },
              { "rncp_details.date_fin_validite_enregistrement": null },
            ],
          },
          {
            CI_inscrit_rncp: {
              $ne: "3 - Inscrit de droit",
            },
            rncp_code: { $eq: null },
            $or: [
              {
                cfd_date_fermeture: {
                  $gt: thresholdDate,
                },
              },
              { cfd_date_fermeture: null },
            ],
          },
        ],
      };

      let result = getExpireRule(new Date(`2021-10-01T00:00:00.000Z`));
      assert.deepStrictEqual(result, expected);
    });

    it("should expire rule on 31/08 of next year if after 01/10", () => {
      const thresholdDate = new Date(`2022-08-31T23:59:59.999Z`);
      const expected = {
        $or: [
          {
            CI_inscrit_rncp: {
              $eq: "3 - Inscrit de droit",
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
            CI_inscrit_rncp: {
              $ne: "3 - Inscrit de droit",
            },
            rncp_code: { $exists: true, $ne: null },
            $or: [
              {
                "rncp_details.date_fin_validite_enregistrement": {
                  $gt: thresholdDate,
                },
              },
              { "rncp_details.date_fin_validite_enregistrement": null },
            ],
          },
          {
            CI_inscrit_rncp: {
              $ne: "3 - Inscrit de droit",
            },
            rncp_code: { $eq: null },
            $or: [
              {
                cfd_date_fermeture: {
                  $gt: thresholdDate,
                },
              },
              { cfd_date_fermeture: null },
            ],
          },
        ],
      };

      let result = getExpireRule(new Date(`2021-11-01T00:00:00.000Z`));
      assert.deepStrictEqual(result, expected);
    });
  });

  describe("getSessionStartDate", () => {
    it("Renvoie le 1er aout après la date de création de la campagne à venir", async () => {
      const expected = new Date(`2024-08-01T00:00:00.000Z`);

      await CampagneStart.create({ created_at: new Date(`2023-09-11T00:00:00.000Z`) });

      let result = await getSessionStartDate();
      assert.deepStrictEqual(result, expected);

      result = await getSessionStartDate();
      assert.deepStrictEqual(result, expected);
    });
  });

  describe("getSessionEndDate", () => {
    it("renvoie le 31 juiller de l'année après la date de création de la campagne à venir", async () => {
      const expected = new Date(`2025-07-31T23:59:59.999Z`);

      await CampagneStart.create({ created_at: new Date(`2023-09-11T00:00:00.000Z`) });

      let result = await getSessionEndDate();
      assert.deepStrictEqual(result, expected);

      result = await getSessionEndDate();
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
                    CI_inscrit_rncp: {
                      $eq: "3 - Inscrit de droit",
                    },
                    cfd_outdated: false,
                  },
                  {
                    CI_inscrit_rncp: {
                      $ne: "3 - Inscrit de droit",
                    },

                    rncp_code: {
                      $exists: true,
                      $ne: null,
                    },
                    "rncp_details.rncp_outdated": false,
                  },
                  {
                    CI_inscrit_rncp: {
                      $ne: "3 - Inscrit de droit",
                    },
                    rncp_code: {
                      $eq: null,
                    },
                    cfd_outdated: false,
                  },
                ],
                // published: true,
              },
            ],
            catalogue_published: true,
          },
          {
            $and: [
              {
                $or: [
                  {
                    CI_inscrit_rncp: {
                      $eq: "3 - Inscrit de droit",
                    },
                  },
                  {
                    CI_inscrit_rncp: {
                      $ne: "3 - Inscrit de droit",
                    },
                    rncp_code: {
                      $exists: true,
                      $ne: null,
                    },
                    "rncp_details.active_inactive": "ACTIVE",
                  },
                  {
                    CI_inscrit_rncp: {
                      $ne: "3 - Inscrit de droit",
                    },
                    rncp_code: {
                      $eq: null,
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

    it("should build a query from an advanced rule", () => {
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
                    CI_inscrit_rncp: {
                      $eq: "3 - Inscrit de droit",
                    },
                    cfd_outdated: false,
                  },
                  {
                    CI_inscrit_rncp: {
                      $ne: "3 - Inscrit de droit",
                    },
                    rncp_code: {
                      $exists: true,
                      $ne: null,
                    },
                    "rncp_details.rncp_outdated": false,
                  },
                  {
                    CI_inscrit_rncp: {
                      $ne: "3 - Inscrit de droit",
                    },
                    rncp_code: {
                      $eq: null,
                    },
                    cfd_outdated: false,
                  },
                ],
                // published: true,
              },
            ],
            catalogue_published: true,
          },
          {
            $and: [
              {
                $or: [
                  {
                    CI_inscrit_rncp: {
                      $eq: "3 - Inscrit de droit",
                    },
                  },
                  {
                    CI_inscrit_rncp: {
                      $ne: "3 - Inscrit de droit",
                    },
                    rncp_code: {
                      $exists: true,
                      $ne: null,
                    },
                    "rncp_details.active_inactive": "ACTIVE",
                  },
                  {
                    CI_inscrit_rncp: {
                      $ne: "3 - Inscrit de droit",
                    },
                    rncp_code: {
                      $eq: null,
                    },
                  },
                ],
              },
            ],
          },
          {
            $and: [
              {
                "bcn_mefs_10.mef10": {
                  $regex: /^254/,
                },
              },
              {
                "bcn_mefs_10.mef10": {
                  $regex: /21$/,
                },
              },
            ],
          },
        ],
        diplome: "BREVET PROFESSIONNEL AGRICOLE DE NIVEAU V",
        niveau: "3 (CAP...)",
        duree: "2",
        annee: "1",
        ...getExpireRule(),
      };

      let result = getQueryFromRule({
        plateforme: "affelnet",
        niveau: "3 (CAP...)",
        diplome: "BREVET PROFESSIONNEL AGRICOLE DE NIVEAU V",
        statut: "à publier (soumis à validation)",
        num_academie: 0,
        regle_complementaire:
          '{"$and":[{"bcn_mefs_10.mef10":{"$regex":"^254"}},{"bcn_mefs_10.mef10":{"$regex":"21$"}}]}',
        regle_complementaire_query:
          '[{"field":"bcn_mefs_10.mef10","operator":"===^","value":"254","combinator":"AND","index":0,"key":"62dc8404-81a6-43ad-8e20-e03cc78dc893"},{"field":"bcn_mefs_10.mef10","operator":"===$","value":"21","combinator":"AND","index":1,"key":"51a98b29-f205-4ccf-b969-a0c2cf95fcfa"}]',
        nom_regle_complementaire: "Brevet Pro Agricole en 2 ans",
        is_deleted: false,
        condition_integration: "peut intégrer",
        duree: "2",
        annee: "1",
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
