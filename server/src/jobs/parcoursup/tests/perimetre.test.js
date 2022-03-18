const assert = require("assert");
const { ReglePerimetre, Formation } = require("../../../common/model/index");
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");
const { run } = require("../perimetre/controller.js");
const { PARCOURSUP_STATUS } = require("../../../constants/status");

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
      statut: PARCOURSUP_STATUS.A_PUBLIER,
      condition_integration: "peut intégrer",
    });
    await ReglePerimetre.create({
      plateforme: "parcoursup",
      niveau: "6 (Licence, BUT...)",
      diplome: "BUT",
      statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
      condition_integration: "peut intégrer",
      statut_academies: { "14": PARCOURSUP_STATUS.A_PUBLIER },
    });
    await ReglePerimetre.create({
      plateforme: "parcoursup",
      niveau: "5 (BTS, DEUST...)",
      diplome: "BTS",
      statut: PARCOURSUP_STATUS.A_PUBLIER,
      condition_integration: "peut intégrer",
      is_deleted: true,
    });
    await ReglePerimetre.create({
      plateforme: "parcoursup",
      niveau: "7 (Master, titre ingénieur...)",
      diplome: "Master",
      statut: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
      condition_integration: "peut intégrer",
    });

    // formations
    await Formation.create({
      published: false,
      etablissement_gestionnaire_catalogue_published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "6 (Licence, BUT...)",
      diplome: "Licence",
      parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
      annee: "1",
      periode,
    });
    await Formation.create({
      published: true,
      etablissement_gestionnaire_catalogue_published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "6 (Licence, BUT...)",
      diplome: "Licence",
      parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
      annee: "1",
      periode,
    });
    await Formation.create({
      published: true,
      etablissement_gestionnaire_catalogue_published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "6 (Licence, BUT...)",
      diplome: "Licence Agri",
      parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
      annee: "1",
      periode,
    });
    await Formation.create({
      published: true,
      etablissement_gestionnaire_catalogue_published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "5 (BTS, DEUST...)",
      diplome: "BTS",
      parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
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
      parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
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
      parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
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
      parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
      parcoursup_id: "56789",
      annee: "1",
      periode,
    });
    await Formation.create({
      published: true,
      etablissement_gestionnaire_catalogue_published: true,
      etablissement_reference_catalogue_published: true,
      niveau: "7 (Master, titre ingénieur...)",
      diplome: "Master",
      parcoursup_statut: PARCOURSUP_STATUS.EN_ATTENTE,
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
      parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
    });
    assert.strictEqual(totalNotRelevant, 3);

    const totalToValidate = await Formation.countDocuments({
      parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
    });
    assert.strictEqual(totalToValidate, 0);

    const totalToValidateRecteur = await Formation.countDocuments({
      parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
    });
    assert.strictEqual(totalToValidateRecteur, 1);

    const totalToCheck = await Formation.countDocuments({ parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER });
    assert.strictEqual(totalToCheck, 2);

    const totalPending = await Formation.countDocuments({
      parcoursup_statut: PARCOURSUP_STATUS.EN_ATTENTE,
    });
    assert.strictEqual(totalPending, 1);

    const totalPsPublished = await Formation.countDocuments({ parcoursup_statut: PARCOURSUP_STATUS.PUBLIE });
    assert.strictEqual(totalPsPublished, 1);

    const totalPsNotPublished = await Formation.countDocuments({
      parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIE,
    });
    assert.strictEqual(totalPsNotPublished, 0);
  });

  describe("CFD & RNCP expiracy checks", () => {
    beforeEach(async () => {
      await Formation.deleteMany();
    });

    it("should stay hors périmètre when cfd is outdated and not a Titre or TP", async () => {
      await Formation.create({
        published: true,
        cfd_outdated: true,
        rncp_details: {
          code_type_certif: "TH",
          rncp_outdated: false,
          active_inactive: "ACTIVE",
        },
        etablissement_gestionnaire_catalogue_published: true,
        etablissement_reference_catalogue_published: true,
        niveau: "6 (Licence, BUT...)",
        diplome: "Licence",
        parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
        annee: "1",
      });

      await run();
      const totalNotRelevant = await Formation.countDocuments({
        parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
      });
      assert.strictEqual(totalNotRelevant, 1);

      const totalToCheck = await Formation.countDocuments({ parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER });
      assert.strictEqual(totalToCheck, 0);
    });

    it("should stay hors périmètre when rcnp is outdated and is a Titre or TP", async () => {
      await Formation.create({
        published: true,
        cfd_outdated: false,
        rncp_details: {
          code_type_certif: "TP",
          rncp_outdated: true,
          active_inactive: "ACTIVE",
        },
        etablissement_gestionnaire_catalogue_published: true,
        etablissement_reference_catalogue_published: true,
        niveau: "6 (Licence, BUT...)",
        diplome: "Licence",
        parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
        annee: "1",
      });

      await run();
      const totalNotRelevant = await Formation.countDocuments({
        parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
      });
      assert.strictEqual(totalNotRelevant, 1);

      const totalToCheck = await Formation.countDocuments({ parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER });
      assert.strictEqual(totalToCheck, 0);
    });

    it("should apply status when cfd is outdated but rncp not outdated and is a Titre or TP", async () => {
      await Formation.create({
        published: true,
        cfd_outdated: true,
        rncp_details: {
          code_type_certif: "Titre",
          rncp_outdated: false,
          active_inactive: "ACTIVE",
        },
        etablissement_gestionnaire_catalogue_published: true,
        etablissement_reference_catalogue_published: true,
        niveau: "6 (Licence, BUT...)",
        diplome: "Licence",
        parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
        annee: "1",
      });

      await run();
      const totalNotRelevant = await Formation.countDocuments({
        parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
      });
      assert.strictEqual(totalNotRelevant, 0);

      const totalToCheck = await Formation.countDocuments({ parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER });
      assert.strictEqual(totalToCheck, 1);
    });

    it("should apply status when rncp is outdated but is not a Titre or TP", async () => {
      await Formation.create({
        published: true,
        cfd_outdated: false,
        rncp_details: {
          code_type_certif: "TH",
          rncp_outdated: true,
          active_inactive: "ACTIVE",
        },
        etablissement_gestionnaire_catalogue_published: true,
        etablissement_reference_catalogue_published: true,
        niveau: "6 (Licence, BUT...)",
        diplome: "Licence",
        parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
        annee: "1",
      });

      await run();
      const totalNotRelevant = await Formation.countDocuments({
        parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
      });
      assert.strictEqual(totalNotRelevant, 0);

      const totalToCheck = await Formation.countDocuments({ parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER });
      assert.strictEqual(totalToCheck, 1);
    });

    it("should stay hors périmètre if date_fin_validite_enregistrement is not far enough", async () => {
      const date_fin_validite_enregistrement = new Date();
      date_fin_validite_enregistrement.setFullYear(new Date().getFullYear() - 1);

      await Formation.create({
        published: true,
        cfd_outdated: true,
        rncp_details: {
          code_type_certif: "Titre",
          rncp_outdated: false,
          active_inactive: "ACTIVE",
          date_fin_validite_enregistrement,
        },
        etablissement_gestionnaire_catalogue_published: true,
        etablissement_reference_catalogue_published: true,
        niveau: "6 (Licence, BUT...)",
        diplome: "Licence",
        parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
        annee: "1",
      });

      await Formation.create({
        published: true,
        cfd_outdated: false,
        rncp_details: {
          code_type_certif: "Titre",
          rncp_outdated: false,
          active_inactive: "ACTIVE",
          date_fin_validite_enregistrement,
        },
        etablissement_gestionnaire_catalogue_published: true,
        etablissement_reference_catalogue_published: true,
        niveau: "6 (Licence, BUT...)",
        diplome: "Licence",
        parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
        annee: "1",
      });

      await run();
      const totalNotRelevant = await Formation.countDocuments({
        parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
      });
      assert.strictEqual(totalNotRelevant, 2);

      const totalToCheck = await Formation.countDocuments({ parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER });
      assert.strictEqual(totalToCheck, 0);
    });

    it("should stay hors périmètre if cfd_date_fermeture is not far enough", async () => {
      const cfd_date_fermeture = new Date();
      cfd_date_fermeture.setFullYear(new Date().getFullYear() - 1);

      await Formation.create({
        published: true,
        cfd_outdated: false,
        cfd_date_fermeture,
        rncp_details: {
          code_type_certif: "TH",
          rncp_outdated: false,
          active_inactive: "ACTIVE",
        },
        etablissement_gestionnaire_catalogue_published: true,
        etablissement_reference_catalogue_published: true,
        niveau: "6 (Licence, BUT...)",
        diplome: "Licence",
        parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
        annee: "1",
      });

      await Formation.create({
        published: true,
        cfd_outdated: false,
        cfd_date_fermeture,
        rncp_details: {
          code_type_certif: "TH",
          rncp_outdated: true,
          active_inactive: "ACTIVE",
        },
        etablissement_gestionnaire_catalogue_published: true,
        etablissement_reference_catalogue_published: true,
        niveau: "6 (Licence, BUT...)",
        diplome: "Licence",
        parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
        annee: "1",
      });

      await run();
      const totalNotRelevant = await Formation.countDocuments({
        parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
      });
      assert.strictEqual(totalNotRelevant, 2);

      const totalToCheck = await Formation.countDocuments({ parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER });
      assert.strictEqual(totalToCheck, 0);
    });
  });
});
