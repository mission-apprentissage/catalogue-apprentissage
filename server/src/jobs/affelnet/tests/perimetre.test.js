const assert = require("assert");
const { ReglePerimetre, Formation } = require("../../../common/model/index");
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");
const { run } = require("../perimetre/controller.js");
const { AFFELNET_STATUS } = require("../../../constants/status");

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
      plateforme: "affelnet",
      niveau: "4 (BAC...)",
      diplome: "MC",
      statut: AFFELNET_STATUS.A_PUBLIER,
      condition_integration: "peut intégrer",
    });
    await ReglePerimetre.create({
      plateforme: "affelnet",
      niveau: "4 (BAC...)",
      diplome: "BAC TECHNO",
      statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
      condition_integration: "peut intégrer",
      statut_academies: { "14": AFFELNET_STATUS.A_PUBLIER },
    });
    await ReglePerimetre.create({
      plateforme: "affelnet",
      niveau: "3 (CAP...)",
      diplome: "CAP",
      statut: AFFELNET_STATUS.A_PUBLIER,
      condition_integration: "peut intégrer",
      is_deleted: true,
    });
    await ReglePerimetre.create({
      plateforme: "affelnet",
      niveau: "4 (BAC...)",
      diplome: "BAC PRO",
      statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
      condition_integration: "peut intégrer",
    });

    // formations
    await Formation.create({
      published: false,
      etablissement_gestionnaire_catalogue_published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "4 (BAC...)",
      diplome: "MC",
      affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
      periode,
    });
    await Formation.create({
      published: true,
      etablissement_gestionnaire_catalogue_published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "4 (BAC...)",
      diplome: "MC",
      affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
      periode,
    });
    await Formation.create({
      published: true,
      etablissement_gestionnaire_catalogue_published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "4 (BAC...)",
      diplome: "MC Agri",
      affelnet_statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
      periode,
    });
    await Formation.create({
      published: true,
      etablissement_gestionnaire_catalogue_published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "3 (CAP...)",
      diplome: "CAP",
      affelnet_statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
      periode,
    });
    await Formation.create({
      published: true,
      etablissement_gestionnaire_catalogue_published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "4 (BAC...)",
      diplome: "BAC TECHNO",
      num_academie: "12",
      affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
      periode,
    });
    await Formation.create({
      published: true,
      etablissement_gestionnaire_catalogue_published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "4 (BAC...)",
      diplome: "BAC TECHNO",
      num_academie: "14",
      affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
      periode,
    });
    await Formation.create({
      published: true,
      etablissement_gestionnaire_catalogue_published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "4 (BAC...)",
      diplome: "BAC PRO",
      num_academie: "14",
      affelnet_statut: AFFELNET_STATUS.PUBLIE,
      periode,
    });
    await Formation.create({
      published: true,
      etablissement_gestionnaire_catalogue_published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "4 (BAC...)",
      diplome: "BAC PRO",
      affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
      periode,
    });
    // await Formation.create({
    //   published: true,
    //   etablissement_gestionnaire_catalogue_published: true,
    //   etablissement_reference_catalogue_published: true,
    //   niveau: "4 (BAC...)",
    //   diplome: "MC",
    //   affelnet_statut: "hors périmètre",
    //   periode: [new Date(`${currentDate.getFullYear()}-02-01T00:00:00.000Z`)],
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

  it("should apply affelnet status", async () => {
    await run();

    const totalNotRelevant = await Formation.countDocuments({
      affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
    });
    assert.strictEqual(totalNotRelevant, 3);

    const totalToValidate = await Formation.countDocuments({
      affelnet_statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
    });
    assert.strictEqual(totalToValidate, 1);

    const totalToCheck = await Formation.countDocuments({ affelnet_statut: AFFELNET_STATUS.A_PUBLIER });
    assert.strictEqual(totalToCheck, 2);

    const totalPending = await Formation.countDocuments({
      affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
    });
    assert.strictEqual(totalPending, 1);

    const totalAfPublished = await Formation.countDocuments({ affelnet_statut: AFFELNET_STATUS.PUBLIE });
    assert.strictEqual(totalAfPublished, 1);

    const totalAfNotPublished = await Formation.countDocuments({
      affelnet_statut: AFFELNET_STATUS.NON_PUBLIE,
    });
    assert.strictEqual(totalAfNotPublished, 0);
  });
});
