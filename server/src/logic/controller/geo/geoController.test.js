const assert = require("assert");
const geoController = require("./geoController");

describe(__filename, () => {
  it("the file builds", () => {
    assert.strictEqual(!!geoController, true);
  });

  it("isValidCodePostal", () => {
    assert.strictEqual(geoController.isValidCodePostal(24000), true);
    assert.strictEqual(geoController.isValidCodePostal(44000), true);
    assert.strictEqual(geoController.isValidCodePostal("45A02"), false);
    assert.strictEqual(geoController.isValidCodePostal(999999999), false);
  });

  it("isValidCodeInsee", () => {
    assert.strictEqual(geoController.isValidCodeInsee(24000), true);
    assert.strictEqual(geoController.isValidCodeInsee(44000), true);
    assert.strictEqual(geoController.isValidCodeInsee("45a02"), true);
    assert.strictEqual(geoController.isValidCodeInsee("45A02"), true);
    assert.strictEqual(geoController.isValidCodeInsee(999999999), false);
  });

  it("findDataByDepartementNum", () => {
    assert.strictEqual(geoController.findDataByDepartementNum("2A")?.nom_dept, "Corse-du-Sud");
    assert.strictEqual(geoController.findDataByDepartementNum("2B")?.nom_dept, "Haute-Corse");
    assert.strictEqual(geoController.findDataByDepartementNum("974")?.nom_dept, "La Réunion");
  });
});
