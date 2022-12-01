const assert = require("assert");
const { getLastMonth, isSameDate, isBetween } = require("../../../../src/common/utils/dateUtils");

describe(__filename, () => {
  describe("getLastMonth", () => {
    it("should work as expected", () => {
      const now = new Date();
      const month = "09";
      const testSeptembre = getLastMonth(month);

      const lastSeptembre =
        now.getMonth() + 1 >= +month
          ? new Date(`${now.getFullYear()}-09-01`)
          : new Date(`${now.getFullYear() - 1}-09-01`);

      assert.strictEqual(testSeptembre.getTime(), lastSeptembre.getTime());
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

  describe("isBetween", () => {
    it("should work as expected", () => {
      // date1 < date2 < date3
      const date1 = new Date(1648049758847);
      const date2 = new Date(1648049758849);
      const date3 = new Date(1699046758849);

      assert.strictEqual(isBetween(date1, date2, date3), true);
      assert.strictEqual(isBetween(date3, date2, date1), true);
      assert.strictEqual(isBetween(date1, date3, date2), false);
      assert.strictEqual(isBetween(date2, date1, date3), false);
    });
  });
});
