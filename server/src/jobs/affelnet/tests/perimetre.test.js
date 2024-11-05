const assert = require("assert");
const { ReglePerimetre, Formation, CampagneStart } = require("../../../common/models");
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");
const { run } = require("../perimetre/controller.js");
const { AFFELNET_STATUS } = require("../../../constants/status");
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
      statut_academies: { 14: AFFELNET_STATUS.A_PUBLIER },
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
      catalogue_published: true,
      niveau: "4 (BAC...)",
      diplome: "MC",
      affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
      periode,
      date_debut,
    });
    await Formation.create({
      ...formationCampagneOk,
      niveau: "4 (BAC...)",
      diplome: "MC",
      affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
    });
    await Formation.create({
      ...formationCampagneOk,

      niveau: "4 (BAC...)",
      diplome: "MC Agri",
      affelnet_statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
    });
    await Formation.create({
      ...formationCampagneOk,

      niveau: "3 (CAP...)",
      diplome: "CAP",
      affelnet_statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
    });
    await Formation.create({
      ...formationCampagneOk,

      niveau: "4 (BAC...)",
      diplome: "BAC TECHNO",
      num_academie: "12",
      affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
    });
    await Formation.create({
      ...formationCampagneOk,

      niveau: "4 (BAC...)",
      diplome: "BAC TECHNO",
      num_academie: "14",
      affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
    });
    await Formation.create({
      ...formationCampagneOk,

      niveau: "4 (BAC...)",
      diplome: "BAC PRO",
      num_academie: "14",
      affelnet_statut: AFFELNET_STATUS.PUBLIE,
      affelnet_id: "PARIS / abcdef",
    });
    await Formation.create({
      ...formationCampagneOk,

      niveau: "4 (BAC...)",
      diplome: "BAC PRO",
      affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
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

  it("should apply affelnet status", async () => {
    await run();

    const totalNotRelevant = await Formation.countDocuments({
      affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
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

  it("should not allow in affelnet", async () => {
    await Formation.deleteMany({});
    await ReglePerimetre.deleteMany({});

    await ReglePerimetre.create({
      plateforme: "affelnet",
      niveau: "3 (CAP...)",
      diplome: "BREVET PROFESSIONNEL AGRICOLE DE NIVEAU V",
      statut: "à publier (soumis à validation)",
      num_academie: 0,
      regle_complementaire: '{"$and":[{"bcn_mefs_10.mef10":{"$regex":"^254"}},{"bcn_mefs_10.mef10":{"$regex":"21$"}}]}',
      regle_complementaire_query:
        '[{"field":"bcn_mefs_10.mef10","operator":"===^","value":"254","combinator":"AND","index":0,"key":"62dc8404-81a6-43ad-8e20-e03cc78dc893"},{"field":"bcn_mefs_10.mef10","operator":"===$","value":"21","combinator":"AND","index":1,"key":"51a98b29-f205-4ccf-b969-a0c2cf95fcfa"}]',
      nom_regle_complementaire: "Brevet Pro Agricole en 2 ans",
      is_deleted: false,
      condition_integration: "peut intégrer",
      duree: "2",
      annee: "1",
    });

    await Formation.create({
      ...formationCampagneOk,

      niveau: "3 (CAP...)",
      diplome: "BREVET PROFESSIONNEL AGRICOLE DE NIVEAU V",
      affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
      duree: "2",
      annee: "1",
      bcn_mefs_10: [],
    });

    await run();

    const totalNotRelevant = await Formation.countDocuments({
      affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
    });
    assert.strictEqual(totalNotRelevant, 1);

    const totalToValidate = await Formation.countDocuments({
      affelnet_statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
    });
    assert.strictEqual(totalToValidate, 0);
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
    cfd_date_fermeture: null,
    annee: "1",
    niveau: "3 (CAP...)",
    diplome: "BREVET PROFESSIONNEL AGRICOLE DE NIVEAU V",
  };

  const perimeterWithdrawalMotives = {
    "catalogue_published: false": { catalogue_published: false },
    "published: false": { published: false },
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

  (async () => {
    await Object.entries(perimeterWithdrawalMotives).map(async ([keyMotif, valueMotif]) => {
      describe(`handle motif (${keyMotif})`, async () => {
        beforeEach(async () => {
          await CampagneStart.create({ created_at: new Date("2024-09-10T00:00:00.000Z") });
          setupBeforeEach();
          await ReglePerimetre.create({
            plateforme: "affelnet",
            niveau: "3 (CAP...)",
            diplome: "BREVET PROFESSIONNEL AGRICOLE DE NIVEAU V",
            statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
            condition_integration: "peut intégrer",
            statut_academies: { 14: AFFELNET_STATUS.A_PUBLIER },
          });
        });
        afterEach(async () => {
          await CampagneStart.deleteMany();
          setupAfterEach();
          await cleanAll();
        });

        it(`should have status different from "non publiable en l'état" if no motif for disparition`, async () => {
          await Formation.create(formationOk);

          await run();

          const totalPublished = await Formation.countDocuments({
            affelnet_statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
          });
          assert.strictEqual(totalPublished, 1);
          const totalOtherStatus = await Formation.countDocuments({
            affelnet_statut: { $nin: [AFFELNET_STATUS.A_PUBLIER_VALIDATION] },
          });
          assert.strictEqual(totalOtherStatus, 0);
        });

        it("should keep status 'publié' if not in perimeter anymore, but already published with a affelnet_id", async () => {
          await Formation.create({
            ...formationOk,
            ...valueMotif,
            affelnet_statut: AFFELNET_STATUS.PUBLIE,
            affelnet_id: "test",
          });

          await run();

          const totalPublished = await Formation.countDocuments({
            affelnet_statut: AFFELNET_STATUS.PUBLIE,
          });
          assert.strictEqual(totalPublished, 1);
          const totalOtherStatus = await Formation.countDocuments({
            affelnet_statut: { $nin: [AFFELNET_STATUS.PUBLIE] },
          });
          assert.strictEqual(totalOtherStatus, 0);
        });

        it("should not keep status 'publié' if not in perimeter anymore, but already published without a affelnet_id", async () => {
          await Formation.create({
            ...formationOk,
            ...valueMotif,
            affelnet_statut: AFFELNET_STATUS.PUBLIE,
            affelnet_id: null,
          });

          await run();

          const totalPublished = await Formation.countDocuments({
            affelnet_statut: AFFELNET_STATUS.PUBLIE,
          });
          assert.strictEqual(totalPublished, 0);
          const totalOtherStatus = await Formation.countDocuments({
            affelnet_statut: { $nin: [AFFELNET_STATUS.PUBLIE] },
          });
          assert.strictEqual(totalOtherStatus, 1);
        });

        await Object.values(AFFELNET_STATUS)
          .filter((status) => ![AFFELNET_STATUS.PUBLIE, AFFELNET_STATUS.NON_PUBLIE].includes(status))
          .map(async (status) => {
            await it(`should apply status "non publiable en l'état" if not in perimeter anymore, and if status was '${status}'`, async () => {
              await Formation.create({ ...formationOk, ...valueMotif, affelnet_statut: status });

              await run();

              const totalHorsPérimètre = await Formation.countDocuments({
                affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
              });
              assert.strictEqual(totalHorsPérimètre, 1);

              const totalOtherStatus = await Formation.countDocuments({
                affelnet_statut: { $nin: [AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT] },
              });
              assert.strictEqual(totalOtherStatus, 0);
            });
          });
      });
    });
  })();
});
