const assert = require("assert");
const { ReglePerimetre, Formation } = require("../../../common/model/index");
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");
const { run } = require("../perimetre/controller.js");

describe(__filename, () => {
  before(async () => {
    // Connection to test collection
    await connectToMongoForTests();
    await ReglePerimetre.deleteMany({});
    await Formation.deleteMany({});

    // insert sample data in DB
    // rules
    await ReglePerimetre.create({
      plateforme: "affelnet",
      niveau: "4 (BAC...)",
      diplome: "MC",
      statut: "à publier",
      condition_integration: "peut intégrer",
    });
    await ReglePerimetre.create({
      plateforme: "affelnet",
      niveau: "4 (BAC...)",
      diplome: "BAC TECHNO",
      statut: "à publier (soumis à validation)",
      condition_integration: "peut intégrer",
      statut_academies: { "14": "à publier" },
    });
    await ReglePerimetre.create({
      plateforme: "affelnet",
      niveau: "3 (CAP...)",
      diplome: "CAP",
      statut: "à publier",
      condition_integration: "peut intégrer",
      is_deleted: true,
    });
    await ReglePerimetre.create({
      plateforme: "affelnet",
      niveau: "4 (BAC...)",
      diplome: "BAC PRO",
      statut: "à publier (soumis à validation)",
      condition_integration: "peut intégrer",
    });

    // formations
    await Formation.create({
      published: false,
      etablissement_reference_catalogue_published: true,
      niveau: "4 (BAC...)",
      diplome: "MC",
      affelnet_statut: "hors périmètre",
    });
    await Formation.create({
      published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "4 (BAC...)",
      diplome: "MC",
      affelnet_statut: "hors périmètre",
    });
    await Formation.create({
      published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "4 (BAC...)",
      diplome: "MC Agri",
      affelnet_statut: "à publier (soumis à validation)",
    });
    await Formation.create({
      published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "3 (CAP...)",
      diplome: "CAP",
      affelnet_statut: "à publier (soumis à validation)",
    });
    await Formation.create({
      published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "4 (BAC...)",
      diplome: "BAC TECHNO",
      num_academie: "12",
      affelnet_statut: "hors périmètre",
    });
    await Formation.create({
      published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "4 (BAC...)",
      diplome: "BAC TECHNO",
      num_academie: "14",
      affelnet_statut: "hors périmètre",
    });
    await Formation.create({
      published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "4 (BAC...)",
      diplome: "BAC PRO",
      num_academie: "14",
      affelnet_statut: "publié",
    });
    await Formation.create({
      published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "4 (BAC...)",
      diplome: "BAC PRO",
      affelnet_statut: "en attente de publication",
    });
  });

  after(async () => {
    await cleanAll();
  });

  it("should have inserted sample data", async () => {
    const countFormations = await Formation.countDocuments({});
    assert.strictEqual(countFormations, 8);

    const countRules = await ReglePerimetre.countDocuments({});
    assert.strictEqual(countRules, 4);
  });

  it("should apply affelnet status", async () => {
    await run();

    const totalNotRelevant = await Formation.countDocuments({
      affelnet_statut: "hors périmètre",
    });
    assert.strictEqual(totalNotRelevant, 3);

    const totalToValidate = await Formation.countDocuments({
      affelnet_statut: "à publier (soumis à validation)",
    });
    assert.strictEqual(totalToValidate, 1);

    const totalToCheck = await Formation.countDocuments({ affelnet_statut: "à publier" });
    assert.strictEqual(totalToCheck, 2);

    const totalPending = await Formation.countDocuments({
      affelnet_statut: "en attente de publication",
    });
    assert.strictEqual(totalPending, 1);

    const totalAfPublished = await Formation.countDocuments({ affelnet_statut: "publié" });
    assert.strictEqual(totalAfPublished, 1);

    const totalAfNotPublished = await Formation.countDocuments({
      affelnet_statut: "non publié",
    });
    assert.strictEqual(totalAfNotPublished, 0);
  });
});
