const assert = require("assert");
const { ReglePerimetre, Formation, CampagneStart } = require("../../../common/models");
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");
const { run } = require("../perimetre/controller.js");
const { PARCOURSUP_STATUS } = require("../../../constants/status");
const { setupAfter, setupBefore, setupAfterEach, setupBeforeEach } = require("../../../../tests/helpers/setup");

const currentDate = new Date();

const periode = [
  new Date(`${currentDate.getFullYear()}-10-01T00:00:00.000Z`),
  new Date(`${currentDate.getFullYear() + 1}-10-01T00:00:00.000Z`),
];

const date_debut = [
  new Date(`${currentDate.getFullYear()}-10-01T00:00:00.000Z`),
  new Date(`${currentDate.getFullYear() + 1}-10-01T00:00:00.000Z`),
];

const formationReglementaireOk = {
  published: true,
  catalogue_published: true,
};

const formationCampagneOk = {
  ...formationReglementaireOk,
  periode,
  date_debut,
  cfd_outdated: false,
  cfd_date_fermeture: null,
  rncp_code: "RNCP1234",
  rncp_details: {
    active_inactive: "ACTIVE",
    code_type_certif: "Test",
    rncp_outdated: false,
    date_fin_validite_enregistrement: null,
  },
};

describe(`${__filename} - Test global (deprecated)`, () => {
  before(async () => {
    setupBefore();

    await CampagneStart.create({ created_at: new Date("2024-09-10T00:00:00.000Z") });

    // Connection to test collection
    await connectToMongoForTests();
    await ReglePerimetre.deleteMany({});
    await Formation.deleteMany({});

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
      statut_academies: { 14: PARCOURSUP_STATUS.A_PUBLIER },
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
      catalogue_published: true,
      niveau: "6 (Licence, BUT...)",
      diplome: "Licence",
      parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
      annee: "1",
      periode,
      date_debut,
    });
    await Formation.create({
      ...formationCampagneOk,
      niveau: "6 (Licence, BUT...)",
      diplome: "Licence",
      parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
      annee: "1",
    });
    await Formation.create({
      ...formationCampagneOk,

      niveau: "6 (Licence, BUT...)",
      diplome: "Licence Agri",
      parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
      annee: "1",
    });
    await Formation.create({
      ...formationCampagneOk,

      niveau: "5 (BTS, DEUST...)",
      diplome: "BTS",
      parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
      annee: "1",
    });
    await Formation.create({
      ...formationCampagneOk,

      niveau: "6 (Licence, BUT...)",
      diplome: "BUT",
      num_academie: "12",
      parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
      annee: "1",
    });
    await Formation.create({
      ...formationCampagneOk,

      niveau: "6 (Licence, BUT...)",
      diplome: "BUT",
      num_academie: "14",
      parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
      annee: "1",
    });
    await Formation.create({
      ...formationCampagneOk,

      niveau: "6 (Licence, BUT...)",
      diplome: "BUT",
      num_academie: "14",
      parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
      parcoursup_id: "56789",
      annee: "1",
    });
    await Formation.create({
      ...formationCampagneOk,

      niveau: "7 (Master, titre ingénieur...)",
      diplome: "Master",
      parcoursup_statut: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
      annee: "1",
    });
  });

  after(async () => {
    setupAfter();
    await cleanAll();
  });

  it("should have inserted sample data", async () => {
    const countFormations = await Formation.countDocuments({});
    assert.strictEqual(countFormations, 8);

    const countRules = await ReglePerimetre.countDocuments({});
    assert.strictEqual(countRules, 4);
  });

  // TODO : Redévelopper en faisant intégrant qu'une seule formation pour chaque test afin de vérifier une seule règle.

  it("should apply parcoursup status", async () => {
    await run();

    const totalNotRelevant = await Formation.countDocuments({
      parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
    });
    assert.strictEqual(totalNotRelevant, 3);

    const totalToValidate = await Formation.countDocuments({
      parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
    });
    assert.strictEqual(totalToValidate, 0);

    const totalToValidateRecteur = await Formation.countDocuments({
      parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
    });
    assert.strictEqual(totalToValidateRecteur, 2);

    const totalToCheck = await Formation.countDocuments({ parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER });
    assert.strictEqual(totalToCheck, 1);

    const totalPending = await Formation.countDocuments({
      parcoursup_statut: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
    });
    assert.strictEqual(totalPending, 1);

    const totalPsPublished = await Formation.countDocuments({ parcoursup_statut: PARCOURSUP_STATUS.PUBLIE });
    assert.strictEqual(totalPsPublished, 1);

    const totalPsNotPublished = await Formation.countDocuments({
      parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIE,
    });
    assert.strictEqual(totalPsNotPublished, 0);
  });
});

describe(`${__filename} - Gestion des status`, async () => {
  beforeEach(async () => {
    setupBeforeEach();
    await ReglePerimetre.deleteMany();

    await CampagneStart.create({ created_at: new Date("2024-09-10T00:00:00.000Z") });
  });
  afterEach(async () => {
    setupAfterEach();
    await cleanAll();
  });

  const formationOk = {
    ...formationCampagneOk,
    rncp_details: {
      code_type_certif: "TH",
      rncp_outdated: false,
      active_inactive: "ACTIVE",
      date_fin_validite_enregistrement: null,
    },
    cfd_outdated: false,
    annee: "1",
    niveau: "6 (Licence, BUT...)",
    diplome: "BUT",
  };

  describe(`handle formations that have never been published`, async () => {
    [
      PARCOURSUP_STATUS.A_PUBLIER,
      PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
      PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
      PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
    ].map(async (status) => {
      it(`should apply statut '${status}'`, async () => {
        await ReglePerimetre.create({
          plateforme: "parcoursup",
          niveau: "6 (Licence, BUT...)",
          diplome: "BUT",
          statut: status,
          condition_integration: "peut intégrer",
        });

        await Formation.create({ ...formationOk, parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT });

        await run();

        const totalHorsPérimètre = await Formation.countDocuments({
          parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
        });
        assert.strictEqual(totalHorsPérimètre, 0);

        const totalOtherStatus = await Formation.countDocuments({
          parcoursup_statut: status,
        });
        assert.strictEqual(totalOtherStatus, 1);
      });

      it(`should keep statut '${status}'`, async () => {
        await ReglePerimetre.create({
          plateforme: "parcoursup",
          niveau: "6 (Licence, BUT...)",
          diplome: "BUT",
          statut: status,
          condition_integration: "peut intégrer",
        });

        await Formation.create({ ...formationOk, parcoursup_statut: status });

        await run();

        const totalHorsPérimètre = await Formation.countDocuments({
          parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
        });
        assert.strictEqual(totalHorsPérimètre, 0);

        const totalOtherStatus = await Formation.countDocuments({
          parcoursup_statut: status,
        });
        assert.strictEqual(totalOtherStatus, 1);
      });
    });
  });

  describe(`handle formations that have been published N-1 and don't need validation`, async () => {
    [PARCOURSUP_STATUS.A_PUBLIER].map(async (status) => {
      it(`should tag as 'prêt pour intégration' if formation is '${status}' and has previously been published`, async () => {
        await ReglePerimetre.create({
          plateforme: "parcoursup",
          niveau: "6 (Licence, BUT...)",
          diplome: "BUT",
          statut: status,
          condition_integration: "peut intégrer",
        });

        await Formation.create({ ...formationOk, parcoursup_id: "56789", parcoursup_statut: status });

        await run();

        const totalHorsPérimètre = await Formation.countDocuments({
          parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
        });
        assert.strictEqual(totalHorsPérimètre, 0);

        const totalOtherStatus = await Formation.countDocuments({
          parcoursup_statut: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
        });
        assert.strictEqual(totalOtherStatus, 1);
      });
    });
  });

  describe(`handle formations that have been published N-1 but need validation`, async () => {
    [
      PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
      PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
      PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
    ].map(async (status) => {
      it(`should not tag as 'prêt pour intégration' if formation is '${status}' and has not previously been published`, async () => {
        await ReglePerimetre.create({
          plateforme: "parcoursup",
          niveau: "6 (Licence, BUT...)",
          diplome: "BUT",
          statut: status,
          condition_integration: "peut intégrer",
        });

        await Formation.create({ ...formationOk, parcoursup_id: "56789", parcoursup_statut: status });

        await run();

        const totalHorsPérimètre = await Formation.countDocuments({
          parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
        });
        assert.strictEqual(totalHorsPérimètre, 0);

        const totalOtherStatus = await Formation.countDocuments({
          parcoursup_statut: status,
        });
        assert.strictEqual(totalOtherStatus, 1);
      });
    });
  });
});

describe(`${__filename} - Gestion de la disparition du périmètre`, async () => {
  const formationOk = {
    ...formationCampagneOk,
    rncp_details: {
      code_type_certif: "TH",
      rncp_outdated: false,
      active_inactive: "ACTIVE",
      date_fin_validite_enregistrement: null,
    },
    cfd_outdated: false,
    annee: "1",
    niveau: "6 (Licence, BUT...)",
    diplome: "BUT",
  };

  const perimeterWithdrawalMotives = {
    "catalogue_published: false": { catalogue_published: false },
    "published: false": { published: false }, // Les formations archivées ne voient plus leur statut réinitialisé
    "rncp_details: { active_inactive: 'ACTIVE', code_type_certif: 'TP', rncp_outdated: true }": {
      rncp_details: { active_inactive: "ACTIVE", code_type_certif: "TP", rncp_outdated: true },
    },
    "rncp_details: { active_inactive: 'ACTIVE', code_type_certif: 'Titre', rncp_outdated: true }": {
      rncp_details: { active_inactive: "ACTIVE", code_type_certif: "Titre", rncp_outdated: true },
    },
    "rncp_details: {  code_type_certif: 'Other' }, cfd_outdated: true": {
      rncp_details: { code_type_certif: "Other" },
      cfd_outdated: true,
    },
  };

  Object.entries(perimeterWithdrawalMotives).map(([keyMotif, valueMotif]) => {
    describe(`handle motif (${keyMotif})`, async () => {
      beforeEach(async () => {
        setupBeforeEach();
        await CampagneStart.create({ created_at: new Date("2024-09-10T00:00:00.000Z") });
        await ReglePerimetre.create({
          plateforme: "parcoursup",
          niveau: "6 (Licence, BUT...)",
          diplome: "BUT",
          statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
          condition_integration: "peut intégrer",
          // statut_academies: { 14: PARCOURSUP_STATUS.A_PUBLIER },
        });
      });
      afterEach(async () => {
        setupAfterEach();
        await cleanAll();
      });

      it(`should have status different from "non publiable en l'état" if no motif for disparition`, async () => {
        await Formation.create(formationOk);

        await run();

        const totalPublished = await Formation.countDocuments({
          parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
        });
        assert.strictEqual(totalPublished, 1);
        const totalOtherStatus = await Formation.countDocuments({
          parcoursup_statut: { $nin: [PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR] },
        });
        assert.strictEqual(totalOtherStatus, 0);
      });

      it("should keep status 'publié' if not in perimeter anymore, but already published with a parcoursup_id", async () => {
        await Formation.create({
          ...formationOk,
          ...valueMotif,
          parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
          parcoursup_id: "test",
        });

        await run();

        const totalPublished = await Formation.countDocuments({
          parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
        });
        assert.strictEqual(totalPublished, 1);
        const totalOtherStatus = await Formation.countDocuments({
          parcoursup_statut: { $nin: [PARCOURSUP_STATUS.PUBLIE] },
        });
        assert.strictEqual(totalOtherStatus, 0);
      });

      it("should not keep status 'publié' if not in perimeter anymore, but already published without a parcoursup_id", async () => {
        await Formation.create({
          ...formationOk,
          ...valueMotif,
          parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
          parcoursup_id: null,
        });

        await run();

        const totalPublished = await Formation.countDocuments({
          parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
        });
        assert.strictEqual(totalPublished, 0);
        const totalOtherStatus = await Formation.countDocuments({
          parcoursup_statut: { $nin: [PARCOURSUP_STATUS.PUBLIE] },
        });
        assert.strictEqual(totalOtherStatus, 1);
      });

      Object.values(PARCOURSUP_STATUS)
        .filter(
          (status) =>
            ![PARCOURSUP_STATUS.PUBLIE, PARCOURSUP_STATUS.FERME, PARCOURSUP_STATUS.NON_PUBLIE].includes(status)
        )
        .map((status) => {
          it(`should apply status "non publiable en l'état" if not in perimeter anymore, and if status was '${status}' (reason: ${JSON.stringify(valueMotif)})`, async () => {
            await Formation.create({ ...formationOk, ...valueMotif, parcoursup_statut: status });

            // if (keyMotif === "published: false") console.error("before", await Formation.find({}).lean());

            await run();

            // if (keyMotif === "published: false") console.error("after", await Formation.find({}).lean());

            const totalHorsPérimètre = await Formation.countDocuments({
              parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
            });
            assert.strictEqual(totalHorsPérimètre, 1);

            const totalOtherStatus = await Formation.countDocuments({
              parcoursup_statut: { $nin: [PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT] },
            });
            assert.strictEqual(totalOtherStatus, 0);
          });
        });
    });
  });
});
