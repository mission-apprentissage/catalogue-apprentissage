const assert = require("assert");
const { getLastMonth, isSameDate } = require("../../../../src/common/utils/dateUtils");

describe(__filename, () => {
  describe("getLastMonth", () => {
    it("should work as expected", () => {
      const now = new Date();

      const toTest = getLastMonth("09");
      const lastSeptembre =
        now.getMonth() > 9 ? new Date(`${now.getFullYear()}-09-01`) : new Date(`${now.getFullYear() - 1}-09-01`);

      assert.strictEqual(toTest.getTime(), lastSeptembre.getTime());
    });
  });

  describe("isSameDate", () => {
    it("should work as expected", () => {
      const date1 = new Date(1648049758847);
      const date2 = new Date(1648049758849);
      const date3 = new Date(1699046758849);

      assert.strictEqual(isSameDate(date1, date2), true);
      assert.strictEqual(isSameDate(date2, date1), true);
      assert.strictEqual(isSameDate(date1, date3), false);
      assert.strictEqual(isSameDate(date2, date3), false);
    });
  });
});
