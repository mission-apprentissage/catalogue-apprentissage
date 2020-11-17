const assert = require("assert");
const { mnaFormationEtablissementsMapper } = require("./etablissementsMapper");

describe(__filename, () => {
  it("Doit ajouter les informations relative à un cfd à un objet formation", async () => {
    assert.deepStrictEqual(await mnaFormationEtablissementsMapper(), null);
  });
});
