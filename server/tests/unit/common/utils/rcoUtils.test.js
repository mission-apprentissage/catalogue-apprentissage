const assert = require("assert");
const { getPeriodeTags } = require("../../../../src/common/utils/rcoUtils");

describe(__filename, () => {
  it("should return empty tags when called without arguments", () => {
    let result = getPeriodeTags();
    assert.deepStrictEqual(result, []);
  });

  it("should retrieve year tags from rco string array", () => {
    let result = getPeriodeTags(["2021-09", "2021-12", "2021-01"]);
    assert.deepStrictEqual(result, ["2021"]);

    result = getPeriodeTags(["2021-09", "2021-12", "2021-01", "2022-01", "2022-05"]);
    assert.deepStrictEqual(result, ["2021", "2022"]);
  });

  it("should sort year tags", () => {
    let result = getPeriodeTags(["2023-01", "2021-12", "2021-01", "2022-01", "2022-05"]);
    assert.deepStrictEqual(result, ["2021", "2022", "2023"]);
  });
});
