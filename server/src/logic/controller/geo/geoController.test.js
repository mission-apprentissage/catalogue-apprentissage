const assert = require("assert");
const geoController = require("./geoController");

describe(__filename, () => {
  it("the file builds", () => {
    assert.strictEqual(!!geoController, true);
  });

  it("findDataByDepartementNum", () => {
    assert.strictEqual(geoController.findDataByDepartementNum("2A")?.nom_dept, "Corse-du-Sud");
    assert.strictEqual(geoController.findDataByDepartementNum("2B")?.nom_dept, "Haute-Corse");
    assert.strictEqual(geoController.findDataByDepartementNum("974")?.nom_dept, "La Réunion");
  });
});
