const assert = require("assert");
const importer = require("../importer/importer");
const {
  formationsJ,
  formationsJMinus1,
  formationsJPlus1,
  formationsJPlus2,
  adding,
  updated,
  deleted,
  reAdded,
} = require("./fixtures");

describe(__filename, () => {
  it("checkAddedFormations >> Si j-1 vide doit remplir l'ensemble des formations J", async () => {
    const collection = importer.lookupDiff(formationsJMinus1, []);
    assert.equal(collection.added.length, 230);
  });

  it("lookupDiff >> Si aucunes modifications entre 2 jours doit retourner null", async () => {
    const collection = importer.lookupDiff(formationsJMinus1, formationsJMinus1);
    assert.equal(collection, null);
  });

  it("lookupDiff >> Si ajouts ou modifications entre 2 jours doit retourner les ajouts et les modifications", async () => {
    const collection = importer.lookupDiff(formationsJ, formationsJMinus1);
    assert.deepStrictEqual(collection, {
      added: [adding],
      updated: [updated],
      deleted: [],
    });
  });

  it("lookupDiff >> Si Supression entre 2 jours doit retourner la(es) formation(s) supprimée(s)", async () => {
    const collection = importer.lookupDiff(formationsJPlus1, formationsJ);
    assert.deepStrictEqual(collection, {
      added: [],
      updated: [],
      deleted: [deleted],
    });
  });

  it("lookupDiff >> Si Ajout doit retourner la(es) formation(s) ajoutée(s)", async () => {
    const collection = importer.lookupDiff(formationsJPlus2, formationsJPlus1); // REACTIVER LA FORMATION
    assert.deepStrictEqual(collection, {
      added: [reAdded],
      updated: [],
      deleted: [],
    });
  });
});
