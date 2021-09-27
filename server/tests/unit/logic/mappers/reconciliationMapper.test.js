const assert = require("assert");
const combinate = require("../../../../src/logic/mappers/reconciliationMapper");
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");

describe(__filename, () => {
  before(async () => {
    // Connection to test collection
    await connectToMongoForTests();
  });

  after(async () => {
    await cleanAll();
  });

  describe("combinate", () => {
    it("should return undefined if called without arguments", () => {
      const result = combinate();
      assert.deepStrictEqual(result, undefined);
    });

    it("should return array if size <= 2", () => {
      const result = combinate([]);
      assert.deepStrictEqual(result, []);
    });

    it("should combinate array in couples", () => {
      const expected = [
        [
          [
            {
              siret: "0",
              type: "gestionnaire",
            },
            {
              siret: "1",
              type: "formateur",
            },
          ],
          [
            {
              siret: "3",
              type: "gestionnaire",
            },
            {
              siret: "2",
              type: "formateur",
            },
          ],
          [
            {
              siret: "5",
              type: "gestionnaire",
            },
            {
              siret: "4",
              type: "formateur",
            },
          ],
        ],
      ];

      const result = combinate([
        { type: "gestionnaire", siret: "0" },
        { type: "formateur", siret: "1" },
        { type: "formateur", siret: "2" },
        { type: "gestionnaire", siret: "3" },
        { type: "formateur", siret: "4" },
        { type: "gestionnaire", siret: "5" },
      ]);
      assert.deepStrictEqual(result, expected);
    });

    it("should place formateur first when there are more", () => {
      const expected = [
        [
          [
            {
              siret: "1",
              type: "formateur",
            },
            {
              siret: "0",
              type: "gestionnaire",
            },
          ],
          [
            {
              siret: "2",
              type: "formateur",
            },
            {
              siret: "3",
              type: "gestionnaire",
            },
          ],
          [
            {
              siret: "4",
              type: "formateur",
            },
            {
              siret: "5",
              type: "gestionnaire",
            },
          ],
          [
            {
              siret: "6",
              type: "formateur",
            },
            {
              siret: "0",
              type: "gestionnaire",
            },
          ],
        ],
      ];

      const result = combinate([
        { type: "gestionnaire", siret: "0" },
        { type: "formateur", siret: "1" },
        { type: "formateur", siret: "2" },
        { type: "gestionnaire", siret: "3" },
        { type: "formateur", siret: "4" },
        { type: "gestionnaire", siret: "5" },
        { type: "formateur", siret: "6" },
      ]);
      assert.deepStrictEqual(result, expected);
    });
  });
});
