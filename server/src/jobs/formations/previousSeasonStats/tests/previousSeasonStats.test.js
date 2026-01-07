const assert = require("assert");
// const collectPreviousSeasonStats = require("../index");
const { connectToMongoForTests, cleanAll } = require("../../../../../tests/utils/testUtils");
const { PreviousSeasonFormation, Formation, PreviousSeasonFormationStat } = require("../../../../common/models");
const { setupBeforeAll, setupAfterAll } = require("../../../../../tests/helpers/setup");

describe(__filename, () => {
  before(async () => {
    setupBeforeAll();
    // Connection to test collection
    await connectToMongoForTests();
    await PreviousSeasonFormation.deleteMany({});
    await Formation.deleteMany({});
    await PreviousSeasonFormationStat.deleteMany({});

    await PreviousSeasonFormation.create({
      cle_ministere_educatif: "1",
      num_academie: "12",
      plateforme: "affelnet",
    });
    await PreviousSeasonFormation.create({
      cle_ministere_educatif: "2",
      num_academie: "06",
      plateforme: "affelnet",
    });
    await PreviousSeasonFormation.create({
      cle_ministere_educatif: "3",
      num_academie: "07",
      plateforme: "affelnet",
    });
  });

  afterEach(async () => {
    await Formation.deleteMany({});
    await PreviousSeasonFormationStat.deleteMany({});
  });

  after(async () => {
    await cleanAll();
    setupAfterAll();
  });

  it("should have inserted sample data", async () => {
    const countPrevious = await PreviousSeasonFormation.countDocuments({});
    assert.strictEqual(countPrevious, 3);

    const count = await Formation.countDocuments({});
    assert.strictEqual(count, 0);

    const countStats = await PreviousSeasonFormationStat.countDocuments({});
    assert.strictEqual(countStats, 0);
  });

  // it("should collect stats", async () => {
  //   await Formation.create({
  //     cle_ministere_educatif: "1",
  //     published: true,
  //     catalogue_published: true,
  //     affelnet_statut: "publié",
  //     parcoursup_statut: "hors périmètre",
  //     etablissement_gestionnaire_certifie_qualite: true,
  //   });

  //   // ensure we don't store just compare
  //   const date = new Date();
  //   date.setDate(date.getDate() + 1);

  //   await collectPreviousSeasonStats({ month: date.getMonth(), date: date.getDate() });

  //   const countStats = await PreviousSeasonFormationStat.countDocuments({});
  //   assert.strictEqual(countStats, 2);

  //   const stat = await PreviousSeasonFormationStat.findOne(
  //     { plateforme: "affelnet" },
  //     { _id: 0, plateforme: 1, vanishing_scope_causes: 1 }
  //   ).lean();

  //   assert.deepStrictEqual(stat, {
  //     plateforme: "affelnet",
  //     vanishing_scope_causes: {
  //       "Clermont-Ferrand": {
  //         closed: 1,
  //       },
  //       Dijon: {
  //         closed: 1,
  //       },
  //     },
  //   });
  // });

  // it("should collect stats and check qualiopi & periode", async () => {
  //   // ensure we don't store just compare
  //   const date = new Date();
  //   date.setDate(date.getDate() + 1);

  //   await Formation.create({
  //     cle_ministere_educatif: "1",
  //     published: true,
  //     catalogue_published: true,
  //     affelnet_statut: "hors périmètre",
  //     parcoursup_statut: "hors périmètre",
  //     etablissement_gestionnaire_certifie_qualite: true,
  //     periode: ["2021-09-01T00:00:00.000Z"],
  //   });

  //   await Formation.create({
  //     cle_ministere_educatif: "2",
  //     published: true,
  //     catalogue_published: true,
  //     affelnet_statut: "hors périmètre",
  //     parcoursup_statut: "hors périmètre",
  //     etablissement_gestionnaire_certifie_qualite: false,
  //   });

  //   await Formation.create({
  //     cle_ministere_educatif: "3",
  //     published: true,
  //     catalogue_published: true,
  //     affelnet_statut: "hors périmètre",
  //     parcoursup_statut: "hors périmètre",
  //     etablissement_gestionnaire_certifie_qualite: true,
  //     periode: [date.toISOString()],
  //   });

  //   await collectPreviousSeasonStats({ month: date.getMonth(), date: date.getDate() });

  //   const countStats = await PreviousSeasonFormationStat.countDocuments({});
  //   assert.strictEqual(countStats, 2);

  //   const stat = await PreviousSeasonFormationStat.findOne(
  //     { plateforme: "affelnet" },
  //     { _id: 0, plateforme: 1, vanishing_scope_causes: 1 }
  //   ).lean();

  //   assert.deepStrictEqual(stat, {
  //     plateforme: "affelnet",
  //     vanishing_scope_causes: {
  //       "Clermont-Ferrand": {
  //         qualiopi_lost: 1,
  //       },
  //       "Nancy-Metz": {
  //         not_updated: 1,
  //       },
  //       Dijon: {
  //         other: 1,
  //       },
  //     },
  //   });
  // });
});
