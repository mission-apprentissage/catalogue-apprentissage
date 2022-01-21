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

    const currentDate = new Date();
    const periode = [
      new Date(`${currentDate.getFullYear()}-10-01T00:00:00.000Z`),
      new Date(`${currentDate.getFullYear() + 1}-10-01T00:00:00.000Z`),
    ];

    // insert sample data in DB
    // rules
    await ReglePerimetre.create({
      plateforme: "parcoursup",
      niveau: "6 (Licence, BUT...)",
      diplome: "Licence",
      statut: "à publier",
      condition_integration: "peut intégrer",
    });
    await ReglePerimetre.create({
      plateforme: "parcoursup",
      niveau: "6 (Licence, BUT...)",
      diplome: "BUT",
      statut: "à publier (soumis à validation Recteur)",
      condition_integration: "peut intégrer",
      statut_academies: { "14": "à publier" },
    });
    await ReglePerimetre.create({
      plateforme: "parcoursup",
      niveau: "5 (BTS, DEUST...)",
      diplome: "BTS",
      statut: "à publier",
      condition_integration: "peut intégrer",
      is_deleted: true,
    });
    await ReglePerimetre.create({
      plateforme: "parcoursup",
      niveau: "7 (Master, titre ingénieur...)",
      diplome: "Master",
      statut: "à publier (vérifier accès direct postbac)",
      condition_integration: "peut intégrer",
    });

    // formations
    await Formation.create({
      published: false,
      etablissement_gestionnaire_catalogue_published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "6 (Licence, BUT...)",
      diplome: "Licence",
      parcoursup_statut: "hors périmètre",
      annee: "1",
      periode,
    });
    await Formation.create({
      published: true,
      etablissement_gestionnaire_catalogue_published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "6 (Licence, BUT...)",
      diplome: "Licence",
      parcoursup_statut: "hors périmètre",
      annee: "1",
      periode,
    });
    await Formation.create({
      published: true,
      etablissement_gestionnaire_catalogue_published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "6 (Licence, BUT...)",
      diplome: "Licence Agri",
      parcoursup_statut: "à publier (vérifier accès direct postbac)",
      annee: "1",
      periode,
    });
    await Formation.create({
      published: true,
      etablissement_gestionnaire_catalogue_published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "5 (BTS, DEUST...)",
      diplome: "BTS",
      parcoursup_statut: "à publier (vérifier accès direct postbac)",
      annee: "1",
      periode,
    });
    await Formation.create({
      published: true,
      etablissement_gestionnaire_catalogue_published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "6 (Licence, BUT...)",
      diplome: "BUT",
      num_academie: "12",
      parcoursup_statut: "hors périmètre",
      annee: "1",
      periode,
    });
    await Formation.create({
      published: true,
      etablissement_gestionnaire_catalogue_published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "6 (Licence, BUT...)",
      diplome: "BUT",
      num_academie: "14",
      parcoursup_statut: "hors périmètre",
      annee: "1",
      periode,
    });
    await Formation.create({
      published: true,
      etablissement_gestionnaire_catalogue_published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "6 (Licence, BUT...)",
      diplome: "BUT",
      num_academie: "14",
      parcoursup_statut: "publié",
      annee: "1",
      periode,
    });
    await Formation.create({
      published: true,
      etablissement_gestionnaire_catalogue_published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "7 (Master, titre ingénieur...)",
      diplome: "Master",
      parcoursup_statut: "en attente de publication",
      annee: "1",
      periode,
    });
    // await Formation.create({
    //   published: true,
    //   etablissement_gestionnaire_catalogue_published: true,
    //   etablissement_reference_catalogue_published: true,
    //   niveau: "6 (Licence, BUT...)",
    //   diplome: "Licence",
    //   parcoursup_statut: "hors périmètre",
    //   annee: "1",
    //   periode: [new Date(`${currentDate.getFullYear()}-03-15T00:00:00.000Z`)],
    // });
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

  it("should apply parcoursup status", async () => {
    await run();

    const totalNotRelevant = await Formation.countDocuments({
      parcoursup_statut: "hors périmètre",
    });
    assert.strictEqual(totalNotRelevant, 3);

    const totalToValidate = await Formation.countDocuments({
      parcoursup_statut: "à publier (vérifier accès direct postbac)",
    });
    assert.strictEqual(totalToValidate, 0);

    const totalToValidateRecteur = await Formation.countDocuments({
      parcoursup_statut: "à publier (soumis à validation Recteur)",
    });
    assert.strictEqual(totalToValidateRecteur, 1);

    const totalToCheck = await Formation.countDocuments({ parcoursup_statut: "à publier" });
    assert.strictEqual(totalToCheck, 2);

    const totalPending = await Formation.countDocuments({
      parcoursup_statut: "en attente de publication",
    });
    assert.strictEqual(totalPending, 1);

    const totalPsPublished = await Formation.countDocuments({ parcoursup_statut: "publié" });
    assert.strictEqual(totalPsPublished, 1);

    const totalPsNotPublished = await Formation.countDocuments({
      parcoursup_statut: "non publié",
    });
    assert.strictEqual(totalPsNotPublished, 0);
  });
});
