const assert = require("assert");
const { findMefsForParcoursup, loadMefsAllowedOnParcoursup } = require("../../../../src/common/utils/parcoursupUtils");

describe(__filename, () => {
  before(() => {
    loadMefsAllowedOnParcoursup([
      { MEF: "3112310921" },
      { MEF: "3113121321" },
      { MEF: "3113342621" },
      { MEF: "3113110321" },
    ]);
  });

  describe("findMefsForParcoursup", () => {
    it("should filter mefs for PS", () => {
      const result = findMefsForParcoursup({
        bcn_mefs_10: [{ mef10: "123456" }, { mef10: "3113121321" }, { mef10: "3113121300" }],
      });
      const expected = [{ mef10: "3113121321" }];
      assert.deepStrictEqual(result, expected);
    });

    it("should not find mefs for PS", () => {
      const result = findMefsForParcoursup({
        bcn_mefs_10: [{ mef10: "123456" }, { mef10: "987654" }, { mef10: "3113121300" }],
      });
      assert.deepStrictEqual(result, []);
    });
  });
});
