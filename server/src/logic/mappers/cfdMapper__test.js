const assert = require("assert");
const { cfdMapper } = require("./cfdMapper");

describe(__filename, () => {
  it("Doit retourner vide", async () => {
    assert.deepStrictEqual(await cfdMapper(), {
      data: null,
      messages: null,
    });
  });

  // it("Doit ajouter les informations relative à un cfd à un objet formation", async () => {
  //   assert.deepStrictEqual(await mnaFormationFromCfdMapper(), {
  //     data: null,
  //     messages: null,
  //   });
  // });
});
