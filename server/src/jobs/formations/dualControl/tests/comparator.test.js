const assert = require("assert");
const { Formation, DualControlFormation, DualControlReport } = require("../../../../common/model/index");
const { connectToMongoForTests, cleanAll } = require("../../../../../tests/utils/testUtils.js");
const { compare } = require("../comparator");

describe(__filename, () => {
  before(async () => {
    // Connection to test collection
    await connectToMongoForTests();
    await Formation.deleteMany({});
    await DualControlFormation.deleteMany({});
    await DualControlReport.deleteMany({});

    // insert sample data in DB
    await Formation.create({
      cle_ministere_educatif: "1",
      lieu_formation_adresse: "20 avenue de SÉGUR",
      cfd: "1",
      rncp_code: "1",
      published: true,
      periode: [
        new Date("2022-09-01T00:00:00.000Z"),
        new Date("2022-10-01T00:00:00.000Z"),
        new Date("2022-11-01T00:00:00.000Z"),
        new Date("2022-12-01T00:00:00.000Z"),
        new Date("2023-01-01T00:00:00.000Z"),
        new Date("2023-02-01T00:00:00.000Z"),
        new Date("2023-03-01T00:00:00.000Z"),
        new Date("2023-04-01T00:00:00.000Z"),
      ],
      bcn_mefs_10: [
        { mef10: "3113121221", modalite: { duree: "2", annee: "1" } },
        { mef10: "3113121222", modalite: { duree: "2", annee: "2" } },
      ],
    });
    await Formation.create({
      cle_ministere_educatif: "2",
      cfd: "2",
      rncp_code: "2",
      published: true,
    });
    await Formation.create({
      cle_ministere_educatif: "3",
      cfd: "3",
      rncp_code: "3",
      published: true,
    });
    await Formation.create({
      cle_ministere_educatif: "4",
      cfd: "4",
      rncp_code: "4",
      published: true,
    });

    await DualControlFormation.create({
      published: true,
      cle_ministere_educatif: "1",
      lieu_formation_adresse: "20 AVENUE de Ségur",
      cfd: "1",
      rncp_code: "111",
      periode: [
        new Date("2022-09-01T00:00:00.000Z"),
        new Date("2022-10-01T00:00:00.000Z"),
        new Date("2022-11-01T00:00:00.000Z"),
        new Date("2022-12-01T00:00:00.000Z"),
        new Date("2023-01-01T00:00:00.000Z"),
        new Date("2023-02-01T00:00:00.000Z"),
        new Date("2023-03-01T00:00:00.000Z"),
        new Date("2023-04-01T00:00:00.000Z"),
      ],
      bcn_mefs_10: [
        { mef10: "3113121222", modalite: { duree: "2", annee: "2" } },
        { mef10: "3113121221", modalite: { duree: "2", annee: "1" } },
      ],
    });
    await DualControlFormation.create({
      published: true,
      cle_ministere_educatif: "2",
      cfd: "222",
      rncp_code: "222",
    });
    await DualControlFormation.create({
      published: true,
      cle_ministere_educatif: "5",
      cfd: "5",
      rncp_code: "5",
    });
    await DualControlFormation.create({
      published: false,
      cle_ministere_educatif: "4",
      cfd: "4",
      rncp_code: "4",
    });
  });

  after(async () => {
    await cleanAll();
  });

  afterEach(async () => {
    await DualControlReport.deleteMany({});
  });

  it("should have inserted sample data", async () => {
    const countF = await Formation.countDocuments({});
    assert.strictEqual(countF, 4);

    const countDF = await DualControlFormation.countDocuments({});
    assert.strictEqual(countDF, 4);

    const countReports = await DualControlReport.countDocuments({});
    assert.strictEqual(countReports, 0);
  });

  it("should compare the two collections", async () => {
    const date = Date.now();
    const result = await compare(date, ["cfd", "rncp_code"]);

    assert.deepStrictEqual(result, {
      discriminator: null,
      date,
      totalFormation: 4,
      totalFormationWithUnpublished: 4,
      totalDualControlFormation: 3,
      totalDualControlFormationWithUnpublished: 4,
      totalNotFound: 1,
      fields: {
        rncp_code: 2,
        cfd: 1,
      },
    });

    const countReports = await DualControlReport.countDocuments({});
    assert.strictEqual(countReports, 2);
    const report = await DualControlReport.findOne({ date, discriminator: null }, { _id: 0, __v: 0 }).lean();
    assert.deepStrictEqual(report, {
      discriminator: null,
      date: new Date(date),
      totalFormation: 4,
      totalFormationWithUnpublished: 4,
      totalDualControlFormation: 3,
      totalDualControlFormationWithUnpublished: 4,
      totalNotFound: 1,
      fields: {
        rncp_code: 2,
        cfd: 1,
      },
    });
  });

  it("should be able to match on Array of Dates", async () => {
    const date = Date.now();
    const result = await compare(date, ["periode"]);

    assert.deepStrictEqual(result, {
      discriminator: null,
      date,
      totalFormation: 4,
      totalFormationWithUnpublished: 4,
      totalDualControlFormation: 3,
      totalDualControlFormationWithUnpublished: 4,
      totalNotFound: 1,
      fields: {
        periode: 0,
      },
    });

    const countReports = await DualControlReport.countDocuments({});
    assert.strictEqual(countReports, 2);

    const report = await DualControlReport.findOne({ date, discriminator: null }, { _id: 0, __v: 0 }).lean();
    assert.deepStrictEqual(report, {
      discriminator: null,
      date: new Date(date),
      totalFormation: 4,
      totalFormationWithUnpublished: 4,
      totalDualControlFormation: 3,
      totalDualControlFormationWithUnpublished: 4,
      totalNotFound: 1,
      fields: {
        periode: 0,
      },
    });
  });

  it("should match array of mefs whatever the order", async () => {
    const date = Date.now();
    const result = await compare(date, ["bcn_mefs_10"]);

    assert.deepStrictEqual(result, {
      discriminator: null,
      date,
      totalFormation: 4,
      totalFormationWithUnpublished: 4,
      totalDualControlFormation: 3,
      totalDualControlFormationWithUnpublished: 4,
      totalNotFound: 1,
      fields: {
        bcn_mefs_10: 0,
      },
    });

    const countReports = await DualControlReport.countDocuments({});
    assert.strictEqual(countReports, 2);

    const report = await DualControlReport.findOne({ date, discriminator: null }, { _id: 0, __v: 0 }).lean();
    assert.deepStrictEqual(report, {
      discriminator: null,
      date: new Date(date),
      totalFormation: 4,
      totalFormationWithUnpublished: 4,
      totalDualControlFormation: 3,
      totalDualControlFormationWithUnpublished: 4,
      totalNotFound: 1,
      fields: {
        bcn_mefs_10: 0,
      },
    });
  });

  it("should match address whatever the case", async () => {
    const date = Date.now();
    const result = await compare(date, ["lieu_formation_adresse"]);

    assert.deepStrictEqual(result, {
      discriminator: null,
      date,
      totalFormation: 4,
      totalFormationWithUnpublished: 4,
      totalDualControlFormation: 3,
      totalDualControlFormationWithUnpublished: 4,
      totalNotFound: 1,
      fields: {
        lieu_formation_adresse: 0,
      },
    });

    const countReports = await DualControlReport.countDocuments({});
    assert.strictEqual(countReports, 2);

    const report = await DualControlReport.findOne({ date, discriminator: null }, { _id: 0, __v: 0 }).lean();
    assert.deepStrictEqual(report, {
      discriminator: null,
      date: new Date(date),
      totalFormation: 4,
      totalFormationWithUnpublished: 4,
      totalDualControlFormation: 3,
      totalDualControlFormationWithUnpublished: 4,
      totalNotFound: 1,
      fields: {
        lieu_formation_adresse: 0,
      },
    });
  });

  it("should add a discriminator when provided", async () => {
    const date = Date.now();
    const result = await compare(date, ["rncp_details.rncp_outdated"], "rncp");

    assert.deepStrictEqual(result, {
      discriminator: "rncp",
      date,
      totalFormation: 4,
      totalFormationWithUnpublished: 4,
      totalDualControlFormation: 3,
      totalDualControlFormationWithUnpublished: 4,
      totalNotFound: 1,
      fields: {
        "rncp_details#rncp_outdated": 0,
      },
    });

    const countReports = await DualControlReport.countDocuments({});
    assert.strictEqual(countReports, 2);

    const report = await DualControlReport.findOne({ date, discriminator: "rncp" }, { _id: 0, __v: 0 }).lean();
    assert.deepStrictEqual(report, {
      discriminator: "rncp",
      date: new Date(date),
      totalFormation: 4,
      totalFormationWithUnpublished: 4,
      totalDualControlFormation: 3,
      totalDualControlFormationWithUnpublished: 4,
      totalNotFound: 1,
      fields: {
        "rncp_details#rncp_outdated": 0,
      },
    });
  });
});
