const assert = require("assert");
const { ReglePerimetre, Formation, CampagneStart } = require("../../../common/models");
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");
const { run } = require("../perimetre/controller.js");
const { PARCOURSUP_STATUS } = require("../../../constants/status");
const { setupAfterAll, setupBeforeAll, setupAfterEach, setupBeforeEach } = require("../../../../tests/helpers/setup");

describe(`${__filename}`, () => {
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

  before(async () => {
    setupBeforeAll();
    await connectToMongoForTests();
  });

  Object.entries(runOk).map(([type, formation]) => {
    describe(`Gestion des status - ${type}`, () => {
      beforeEach(async () => {
        setupBeforeEach();
        await ReglePerimetre.deleteMany();

        await CampagneStart.create({ created_at: new Date(`${currentDate.getFullYear()}-09-10T00:00:00.000Z`) });
      });
      afterEach(async () => {
        setupAfterEach();
        await cleanAll();
      });

      const formationOk = {
        ...formation,
        annee: "1",
        niveau: "6 (Licence, BUT...)",
        diplome: "BUT",
      };

      describe(`handle formations that have never been published - ${type}`, () => {
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

      describe(`handle formations that have been published N-1 and don't need validation - ${type}`, () => {
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
            assert.strictEqual(
              totalHorsPérimètre,
              0,
              JSON.stringify({
                results: await Formation.find({}, { parcoursup_statut: 1 }),
              })
            );

            const totalOtherStatus = await Formation.countDocuments({
              parcoursup_statut: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
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

      describe(`handle formations that have been published N-1 but need validation - ${type}`, () => {
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
            assert.strictEqual(
              totalHorsPérimètre,
              0,
              JSON.stringify({
                results: await Formation.find({}, { parcoursup_statut: 1 }),
              })
            );

            const totalOtherStatus = await Formation.countDocuments({
              parcoursup_statut: status,
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

    describe(`Gestion de la disparition du périmètre - ${type}`, () => {
      const formationOk = {
        ...formation,
        annee: "1",
        niveau: "6 (Licence, BUT...)",
        diplome: "BUT",
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
            await CampagneStart.create({ created_at: new Date(`${currentDate.getFullYear()}-09-10T00:00:00.000Z`) });
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

            assert.strictEqual(
              totalPublished,
              1,
              JSON.stringify({
                results: await Formation.find({}, { parcoursup_statut: 1 }),
              })
            );
            const totalOtherStatus = await Formation.countDocuments({
              parcoursup_statut: { $nin: [PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR] },
            });

            assert.strictEqual(
              totalOtherStatus,
              0,
              JSON.stringify({
                results: await Formation.find({}, { parcoursup_statut: 1 }),
              })
            );
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
            assert.strictEqual(
              totalPublished,
              1,
              JSON.stringify({
                results: await Formation.find({}, { parcoursup_statut: 1 }),
              })
            );
            const totalOtherStatus = await Formation.countDocuments({
              parcoursup_statut: { $nin: [PARCOURSUP_STATUS.PUBLIE] },
            });
            assert.strictEqual(
              totalOtherStatus,
              0,
              JSON.stringify({
                results: await Formation.find({}, { parcoursup_statut: 1 }),
              })
            );
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
            assert.strictEqual(
              totalPublished,
              0,
              JSON.stringify({
                results: await Formation.find({}, { parcoursup_statut: 1 }),
              })
            );
            const totalOtherStatus = await Formation.countDocuments({
              parcoursup_statut: { $nin: [PARCOURSUP_STATUS.PUBLIE] },
            });
            assert.strictEqual(
              totalOtherStatus,
              1,
              JSON.stringify({
                results: await Formation.find({}, { parcoursup_statut: 1 }),
              })
            );
          });

          Object.values(PARCOURSUP_STATUS)
            .filter(
              (status) =>
                ![PARCOURSUP_STATUS.PUBLIE, PARCOURSUP_STATUS.FERME, PARCOURSUP_STATUS.NON_PUBLIE].includes(status)
            )
            .map((status) => {
              it(`should apply status "non publiable en l'état" if not in perimeter anymore, and if status was '${status}' (reason: ${JSON.stringify(valueMotif)})`, async () => {
                await Formation.create({ ...formationOk, ...valueMotif, parcoursup_statut: status });

                await run();

                const resultingStatut = (await Formation.findOne())?.parcoursup_statut;
                assert.strictEqual(resultingStatut, PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT);

                const totalHorsPérimètre = await Formation.countDocuments({
                  parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
                });
                assert.strictEqual(
                  totalHorsPérimètre,
                  1,
                  JSON.stringify({
                    results: await Formation.find({}, { parcoursup_statut: 1 }),
                  })
                );

                const totalOtherStatus = await Formation.countDocuments({
                  parcoursup_statut: { $nin: [PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT] },
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
});
