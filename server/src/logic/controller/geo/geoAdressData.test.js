const assert = require("assert");
const geoAddressData = require("./geoAdresseData");

describe(__filename, () => {
  it("the file builds", () => {
    assert.strictEqual(!!geoAddressData, true);
  });
});
