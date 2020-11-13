const assert = require("assert");
const importer = require("../importer/importer");
const { formationsJ, formationsJMinus1, formationsJPlus1, formationsJPlus2, adding } = require("./fixtures");
const { RcoFormation } = require("../../../common/model/index");
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");

describe(__filename, () => {
  before(async () => {
    // Connection to test collection
    await connectToMongoForTests();
    await RcoFormation.deleteMany({});
    const collection = importer.lookupDiff(formationsJMinus1, []);
    const result = await importer.addedFormationsHandler(collection.added);
    importer.addtoDbTasks(result);
    await importer.dbOperationsHandler();
    importer.resetReport();
  });

  after(async () => {
    await cleanAll();
  });

  afterEach(() => {
    importer.resetReport();
  });

  it("checkAddedFormations >> Si aucunes modifications entre 2 jours ne doit retourner aucunes modifications de db", async () => {
    const collection = importer.lookupDiff(formationsJMinus1, formationsJMinus1);
    const result = await importer.addedFormationsHandler(collection);
    assert.deepStrictEqual(result, {
      toAddToDb: [],
      toUpdateToDb: [],
    });
    const count = await RcoFormation.countDocuments({});
    assert.equal(count, 230);
  });

  it("lookupDiff >> Si ajouts ou modifications entre 2 jours doit ajouter et modifier en db", async () => {
    const collection = importer.lookupDiff(formationsJ, formationsJMinus1);

    const resultAdded = await importer.addedFormationsHandler(collection.added);
    importer.addtoDbTasks(resultAdded);

    const resultUpdated = await importer.updatedFormationsHandler(collection.updated);
    importer.addtoDbTasks(resultUpdated);

    await importer.dbOperationsHandler();

    assert.deepStrictEqual(resultAdded, {
      toAddToDb: [adding],
      toUpdateToDb: [],
    });

    const count = await RcoFormation.countDocuments({});
    assert.equal(count, 231);

    const updatedFormation = await importer.getRcoFormation({
      id_formation: "24_208037",
      id_action: "24_1462311",
      id_certifinfo: "106623",
    });

    assert.deepStrictEqual(updatedFormation.periode, ["2021-11", "2021-12"]);
    assert.deepStrictEqual(updatedFormation.updates_history[0].from, { periode: ["2021-11"] });
    assert.deepStrictEqual(updatedFormation.updates_history[0].to, { periode: ["2021-11", "2021-12"] });
  });

  it("lookupDiff >> Si Supression entre 2 jours doit dépublier la formation en db", async () => {
    const collection = importer.lookupDiff(formationsJPlus1, formationsJ);

    const resultDeleted = await importer.deletedFormationsHandler(collection.deleted);
    importer.addtoDbTasks(resultDeleted);

    await importer.dbOperationsHandler();

    assert.deepStrictEqual(resultDeleted.toUpdateToDb[0].updateInfo, { published: false });

    const count = await RcoFormation.countDocuments({});
    assert.equal(count, 231);

    const deletedFormation = await importer.getRcoFormation({
      id_formation: "24_207466",
      id_action: "24_1461053",
      id_certifinfo: "100429",
    });

    assert.equal(deletedFormation.published, false);
    assert.deepStrictEqual(deletedFormation.updates_history[0].from, { published: true });
    assert.deepStrictEqual(deletedFormation.updates_history[0].to, { published: false });
  });

  it("lookupDiff >> Si Ajout d'une formation deja presente doit retourner la(es) formation(s) reactivée et mise à jour", async () => {
    const collection = importer.lookupDiff(formationsJPlus2, formationsJPlus1);

    const resultAdded = await importer.addedFormationsHandler(collection.added);
    importer.addtoDbTasks(resultAdded);

    await importer.dbOperationsHandler();

    const count = await RcoFormation.countDocuments({});
    assert.equal(count, 231);

    const updatedFormation = await importer.getRcoFormation({
      id_formation: "24_207466",
      id_action: "24_1461053",
      id_certifinfo: "100429",
    });

    assert.equal(updatedFormation.published, true);
    assert.deepStrictEqual(updatedFormation.updates_history[1].from, {
      published: false,
      periode: [
        "2021-01",
        "2021-02",
        "2021-03",
        "2021-04",
        "2021-05",
        "2021-06",
        "2021-09",
        "2021-10",
        "2021-11",
        "2021-12",
        "2022-01",
        "2022-02",
        "2022-03",
        "2022-04",
        "2022-05",
        "2022-06",
      ],
    });
    assert.deepStrictEqual(updatedFormation.updates_history[1].to, {
      published: true,
      periode: [
        "2021-01",
        "2021-02",
        "2021-03",
        "2021-04",
        "2021-05",
        "2021-06",
        "2021-09",
        "2021-10",
        "2021-11",
        "2021-12",
        "2022-01",
        "2022-02",
        "2022-03",
        "2022-04",
        "2022-05",
        "2022-07",
      ],
    });
  });
});
