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
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");
const { RcoFormation } = require("../../../common/model/index");

describe(__filename, () => {
  before(async () => {
    // Connection to test collection
    await connectToMongoForTests();
    await RcoFormation.deleteMany({});
    importer.resetReport();
  });

  after(async () => {
    await cleanAll();
  });

  afterEach(() => {
    importer.resetReport();
  });

  it("checkAddedFormations >> Si j-1 vide doit remplir l'ensemble des formations J", async () => {
    const collection = await importer.lookupDiff(formationsJMinus1);
    assert.equal(collection.added.length, 230);

    const result = await importer.addedFormationsHandler(collection.added);
    importer.addtoDbTasks(result);
    await importer.dbOperationsHandler();
  });

  it("lookupDiff >> Si aucunes modifications entre 2 jours doit retourner null", async () => {
    const collection = await importer.lookupDiff(formationsJMinus1);
    assert.equal(collection, null);
  });

  it("lookupDiff >> Si ajouts ou modifications entre 2 jours doit retourner les ajouts et les modifications", async () => {
    const collection = await importer.lookupDiff(formationsJ);
    assert.deepStrictEqual(collection, {
      added: [adding],
      updated: [updated],
      deleted: [],
    });

    const addedFormations = await importer.addedFormationsHandler(collection.added);
    importer.addtoDbTasks(addedFormations);

    const updatedFormations = await importer.updatedFormationsHandler(collection.updated);
    importer.addtoDbTasks(updatedFormations);

    await importer.dbOperationsHandler();
  });

  it("lookupDiff >> Si Supression entre 2 jours doit retourner la(es) formation(s) supprimée(s)", async () => {
    const collection = await importer.lookupDiff(formationsJPlus1);
    assert.equal(collection.added.length, 0);
    assert.equal(collection.updated.length, 0);
    assert.equal(collection.deleted.length, 1);

    assert.equal(collection.deleted[0].id_formation, deleted.id_formation);
    assert.equal(collection.deleted[0].id_action, deleted.id_action);
    assert.equal(collection.deleted[0].id_certifinfo, deleted.id_certifinfo);

    const deletedFormations = await importer.deletedFormationsHandler(collection.deleted);
    importer.addtoDbTasks(deletedFormations);
    await importer.dbOperationsHandler();
  });

  it("lookupDiff >> Si Ajout doit retourner la(es) formation(s) ajoutée(s)", async () => {
    const collection = await importer.lookupDiff(formationsJPlus2); // REACTIVER LA FORMATION
    assert.deepStrictEqual(collection, {
      added: [reAdded],
      updated: [],
      deleted: [],
    });
  });
});
