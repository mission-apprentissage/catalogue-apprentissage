const assert = require("assert");
const { ReglePerimetre, Formation } = require("../../../common/model/index");
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");
const { run } = require("../perimetre/controller.js");
const { PARCOURSUP_STATUS } = require("../../../constants/status");
const { setupBefore, setupAfter, setupAfterEach, setupBeforeEach } = require("../../../../tests/helpers/setup");

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
};

describe(`${__filename} - Test global (deprecated)`, () => {
  before(async () => {
    setupBefore();

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
      parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
      annee: "1",
      periode,
      date_debut,
    });
    await Formation.create({
      ...formationCampagneOk,
      niveau: "6 (Licence, BUT...)",
      diplome: "Licence",
      parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
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
      parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
      annee: "1",
    });
    await Formation.create({
      ...formationCampagneOk,
      niveau: "6 (Licence, BUT...)",
      diplome: "BUT",
      num_academie: "14",
      parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
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
      parcoursup_statut: PARCOURSUP_STATUS.EN_ATTENTE,
      annee: "1",
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
    setupAfter();
    await cleanAll();
  });

  it("should have inserted sample data", async () => {
    const countFormations = await Formation.countDocuments({});
    assert.strictEqual(countFormations, 8);

    const countRules = await ReglePerimetre.countDocuments({});
    assert.strictEqual(countRules, 4);
  });

  // Redévelopper en faisant intégrant qu'une seule formation pour chaque test afin de vérifier une seule règle.

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
});

describe(`${__filename} - Gestion de la disparition du périmètre`, async () => {
  const formationOk = {
    ...formationCampagneOk,
    rncp_details: {
      code_type_certif: "TH",
      rncp_outdated: false,
      active_inactive: "ACTIVE",
    },
    cfd_outdated: false,
    annee: "1",
    niveau: "6 (Licence, BUT...)",
    diplome: "BUT",
  };

  const perimeterWithdrawalMotives = {
    "catalogue_published: false": { catalogue_published: false },
    "published: false": { published: false },
    "rncp_details: { code_type_certif: 'TP', rncp_outdated: true }": {
      rncp_details: { code_type_certif: "TP", rncp_outdated: true },
    },
    "rncp_details: { code_type_certif: 'Titre', rncp_outdated: true }": {
      rncp_details: { code_type_certif: "Titre", rncp_outdated: true },
    },
    "rncp_details: {  code_type_certif: 'Other' }, cfd_outdated: true": {
      rncp_details: { code_type_certif: "Other" },
      cfd_outdated: true,
    },
  };

  (async () => {
    await Object.entries(perimeterWithdrawalMotives).map(async ([keyMotif, valueMotif]) => {
      describe(`handle motif (${keyMotif})`, async () => {
        beforeEach(async () => {
          setupBeforeEach();
          await ReglePerimetre.create({
            plateforme: "parcoursup",
            niveau: "6 (Licence, BUT...)",
            diplome: "BUT",
            statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
            condition_integration: "peut intégrer",
            statut_academies: { 14: PARCOURSUP_STATUS.A_PUBLIER },
          });
        });
        afterEach(async () => {
          setupAfterEach();
          await cleanAll();
        });

        it("should have status different from 'hors périmètre' if no motif for disparition", async () => {
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

        await Object.values(PARCOURSUP_STATUS)
          .filter((status) => status !== PARCOURSUP_STATUS.PUBLIE)
          .map(async (status) => {
            await it(`should apply status 'hors périmètre' if not in perimeter anymore, and if status was '${status}'`, async () => {
              await Formation.create({ ...formationOk, ...valueMotif, parcoursup_statut: status });

              await run();

              const totalHorsPérimètre = await Formation.countDocuments({
                parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
              });
              assert.strictEqual(totalHorsPérimètre, 1);

              const totalOtherStatus = await Formation.countDocuments({
                parcoursup_statut: { $nin: [PARCOURSUP_STATUS.HORS_PERIMETRE] },
              });
              assert.strictEqual(totalOtherStatus, 0);
            });
          });
      });
    });
  })();
});
