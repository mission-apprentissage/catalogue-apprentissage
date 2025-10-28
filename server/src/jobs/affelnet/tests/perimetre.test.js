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
};

const formationInscriteDeDroitOk = {
  ...formationCampagneOk,
  CI_inscrit_rncp: "3 - Inscrit de droit",
  rncp_code: null,
  cfd_outdated: false,
  cfd_date_fermeture: null,
};

const formationSurDemandeOk = {
  ...formationCampagneOk,
  CI_inscrit_rncp: "4 - Inscrit sur demande",
  rncp_code: "RNCP1234",
  rncp_details: {
    active_inactive: "ACTIVE",
    code_type_certif: "Test",
    rncp_outdated: false,
    date_fin_validite_enregistrement: null,
  },
};

const formationInscriteDeDroitNonOk = {
  ...formationCampagneOk,
  CI_inscrit_rncp: "3 - Inscrit de droit",
  cfd_outdated: true,
  cfd_date_fermeture: new Date(`${currentDate.getFullYear() - 1}-10-01T00:00:00.000Z`),
};

const formationSurDemandeNonOk = {
  ...formationCampagneOk,
  CI_inscrit_rncp: "4 - Inscrit sur demande",
  rncp_code: "RNCP1234",
  rncp_details: {
    active_inactive: "INACTIVE",
    code_type_certif: "Test",
    rncp_outdated: true,
    date_fin_validite_enregistrement: new Date(`${currentDate.getFullYear() - 1}-10-01T00:00:00.000Z`),
  },
};

const runOk = {
  "inscrit de droit": formationInscriteDeDroitOk,
  "sur demande": formationSurDemandeOk,
};

Object.entries(runOk).map(([type, formation]) => {
  describe(`${__filename} - Gestion des status - ${type}`, () => {
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
      ...formation,
      annee: "1",
      niveau: "3 (CAP...)",
      diplome: "BREVET PROFESSIONNEL AGRICOLE DE NIVEAU V",
    };

    describe(`handle formations that have never been published`, () => {
      [AFFELNET_STATUS.A_PUBLIER, AFFELNET_STATUS.A_PUBLIER_VALIDATION].map(async (status) => {
        it(`should apply statut '${status}'`, async () => {
          await ReglePerimetre.create({
            plateforme: "affelnet",
            niveau: "3 (CAP...)",
            diplome: "BREVET PROFESSIONNEL AGRICOLE DE NIVEAU V",
            statut: status,
            condition_integration: "peut intégrer",
          });

          await Formation.create({ ...formationOk, affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT });

          await run();

          const totalHorsPérimètre = await Formation.countDocuments({
            affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
          });
          assert.strictEqual(totalHorsPérimètre, 0);

          const totalOtherStatus = await Formation.countDocuments({
            affelnet_statut: status,
          });
          assert.strictEqual(totalOtherStatus, 1);
        });

        it(`should keep statut '${status}'`, async () => {
          await ReglePerimetre.create({
            plateforme: "affelnet",
            niveau: "3 (CAP...)",
            diplome: "BREVET PROFESSIONNEL AGRICOLE DE NIVEAU V",
            statut: status,
            condition_integration: "peut intégrer",
          });

          await Formation.create({ ...formationOk, affelnet_statut: status });

          await run();

          const totalHorsPérimètre = await Formation.countDocuments({
            affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
          });
          assert.strictEqual(totalHorsPérimètre, 0);

          const totalOtherStatus = await Formation.countDocuments({
            affelnet_statut: status,
          });
          assert.strictEqual(totalOtherStatus, 1);
        });
      });
    });

    describe(`handle formations that have been published N-1 and don't need validation`, () => {
      [AFFELNET_STATUS.A_PUBLIER].map(async (status) => {
        it(`should tag as 'prêt pour intégration' if formation is '${status}' and has previously been published`, async () => {
          await ReglePerimetre.create({
            plateforme: "affelnet",
            niveau: "3 (CAP...)",
            diplome: "BREVET PROFESSIONNEL AGRICOLE DE NIVEAU V",
            statut: status,
            condition_integration: "peut intégrer",
          });

          await Formation.create({ ...formationOk, affelnet_id: "PARIS/abcdef", affelnet_statut: status });

          await run();

          const totalHorsPérimètre = await Formation.countDocuments({
            affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
          });
          assert.strictEqual(
            totalHorsPérimètre,
            0,
            JSON.stringify({
              results: await Formation.find({}, { parcoursup_statut: 1 }),
            })
          );

          const totalOtherStatus = await Formation.countDocuments({
            affelnet_statut: AFFELNET_STATUS.PRET_POUR_INTEGRATION,
          });
          assert.strictEqual(
            totalOtherStatus,
            1,
            JSON.stringify({
              results: await Formation.find({}, { parcoursup_statut: 1 }),
            })
          );
        });
      });
    });

    describe(`handle formations that have been published N-1 but need validation`, () => {
      [AFFELNET_STATUS.A_PUBLIER_VALIDATION].map(async (status) => {
        it(`should not tag as 'prêt pour intégration' if formation is '${status}' and has not previously been published`, async () => {
          await ReglePerimetre.create({
            plateforme: "affelnet",
            niveau: "3 (CAP...)",
            diplome: "BREVET PROFESSIONNEL AGRICOLE DE NIVEAU V",
            statut: status,
            condition_integration: "peut intégrer",
          });

          await Formation.create({ ...formationOk, affelnet_id: "PARIS/abcdef", affelnet_statut: status });

          await run();

          const totalHorsPérimètre = await Formation.countDocuments({
            affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
          });
          assert.strictEqual(
            totalHorsPérimètre,
            0,
            JSON.stringify({
              results: await Formation.find({}, { parcoursup_statut: 1 }),
            })
          );

          const totalOtherStatus = await Formation.countDocuments({
            affelnet_statut: status,
          });
          assert.strictEqual(
            totalOtherStatus,
            1,
            JSON.stringify({
              results: await Formation.find({}, { parcoursup_statut: 1 }),
            })
          );
        });
      });
    });
  });

  describe(`${__filename} - Gestion de la disparition du périmètre - ${type}`, () => {
    const formationOk = {
      ...formation,
      annee: "1",
      niveau: "3 (CAP...)",
      diplome: "BREVET PROFESSIONNEL AGRICOLE DE NIVEAU V",
    };

    const perimeterWithdrawalMotives = {
      "catalogue_published: false": { catalogue_published: false },
      "published: false": { published: false }, // Les formations archivées ne voient plus leur statut réinitialisé

      ...(type === "inscrit de droit"
        ? {
            "cfd_outdated: true": {
              cfd_outdated: true,
            },
          }
        : {
            "rncp_outdated: true": {
              rncp_details: { rncp_outdated: true },
            },
          }),
    };

    Object.entries(perimeterWithdrawalMotives).map(([keyMotif, valueMotif]) => {
      describe(`handle motif (${keyMotif}) - ${type}`, () => {
        beforeEach(async () => {
          setupBeforeEach();
          await CampagneStart.create({ created_at: new Date("2024-09-10T00:00:00.000Z") });
          await ReglePerimetre.create({
            plateforme: "affelnet",
            niveau: "3 (CAP...)",
            diplome: "BREVET PROFESSIONNEL AGRICOLE DE NIVEAU V",
            statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
            condition_integration: "peut intégrer",
            // statut_academies: { 14: AFFELNET_STATUS.A_PUBLIER },
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
            affelnet_statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
          });

          assert.strictEqual(
            totalPublished,
            1,
            JSON.stringify({
              results: await Formation.find({}, { parcoursup_statut: 1 }),
            })
          );
          const totalOtherStatus = await Formation.countDocuments({
            affelnet_statut: { $nin: [AFFELNET_STATUS.A_PUBLIER_VALIDATION] },
          });

          assert.strictEqual(
            totalOtherStatus,
            0,
            JSON.stringify({
              results: await Formation.find({}, { parcoursup_statut: 1 }),
            })
          );
        });

        it("should not keep status 'publié' if not in perimeter anymore", async () => {
          await Formation.create({
            ...formationOk,
            ...valueMotif,
            affelnet_statut: AFFELNET_STATUS.PUBLIE,
            affelnet_id: "PARIS/abcdef",
          });

          await run();

          const totalPublished = await Formation.countDocuments({
            affelnet_statut: AFFELNET_STATUS.PUBLIE,
          });
          assert.strictEqual(
            totalPublished,
            0,
            JSON.stringify({
              results: await Formation.find({}, { parcoursup_statut: 1 }),
            })
          );
          const totalOtherStatus = await Formation.countDocuments({
            affelnet_statut: { $nin: [AFFELNET_STATUS.PUBLIE] },
          });
          assert.strictEqual(
            totalOtherStatus,
            1,
            JSON.stringify({
              results: await Formation.find({}, { parcoursup_statut: 1 }),
            })
          );
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

        Object.values(AFFELNET_STATUS)
          .filter((status) => ![AFFELNET_STATUS.PUBLIE, AFFELNET_STATUS.NON_PUBLIE].includes(status))
          .map((status) => {
            it(`should apply status "non publiable en l'état" if not in perimeter anymore, and if status was '${status}' (reason: ${JSON.stringify(valueMotif)})`, async () => {
              await Formation.create({ ...formationOk, ...valueMotif, affelnet_statut: status });

              await run();

              const resultingStatut = (await Formation.findOne())?.affelnet_statut;
              assert.strictEqual(resultingStatut, AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT);

              const totalHorsPérimètre = await Formation.countDocuments({
                affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
              });
              assert.strictEqual(
                totalHorsPérimètre,
                1,
                JSON.stringify({
                  results: await Formation.find({}, { parcoursup_statut: 1 }),
                })
              );

              const totalOtherStatus = await Formation.countDocuments({
                affelnet_statut: { $nin: [AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT] },
              });
              assert.strictEqual(
                totalOtherStatus,
                0,
                JSON.stringify({
                  results: await Formation.find({}, { parcoursup_statut: 1 }),
                })
              );
            });
          });
      });
    });
  });
});
