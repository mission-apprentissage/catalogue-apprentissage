const updater = require("./updater/updater");
const { runScript } = require("../../scriptWrapper");
const { Formation, RcoFormation, SandboxFormation } = require("../../../common/model/index");
const { storeByChunks } = require("../../../common/utils/reportUtils");
const report = require("../../../logic/reporter/report");
const { createReportNewDiplomeGrandAge } = require("../../../logic/controller/diplomes-grand-age");
const config = require("config");

const managedUnPublishedRcoFormation = async () => {
  // if rco formation is not published, don't call mnaUpdater
  // since we just want to hide the formation

  const rcoFormationNotPublishedIds = await RcoFormation.distinct("cle_ministere_educatif", { published: false });
  await Formation.updateMany(
    { cle_ministere_educatif: { $in: [...rcoFormationNotPublishedIds, null] } },
    {
      $set: {
        published: false,
        rco_published: false,
        update_error: null,
        to_update: false,
      },
    }
  );

  return [...rcoFormationNotPublishedIds, null];
};

const createReport = async (
  { invalidFormations, updatedFormations, noUpdatedFormations, unpublishedFormations },
  uuidReport,
  noMail = false
) => {
  const summary = {
    invalidCount: invalidFormations.length,
    updatedCount: updatedFormations.length,
    notUpdatedCount: noUpdatedFormations.length,
    unpublishedCount: unpublishedFormations.length,
  };

  // save report in db
  const date = Date.now();
  const type = "trainingsUpdate";

  await storeByChunks(type, date, summary, "updated", updatedFormations, uuidReport);
  await storeByChunks(type, date, summary, "noupdated", noUpdatedFormations, uuidReport);
  await storeByChunks(type, date, summary, "unpublished", unpublishedFormations, uuidReport);
  await storeByChunks(`${type}.error`, date, summary, "errors", invalidFormations, uuidReport);

  let link = `${config.publicUrl}/report?type=${type}&date=${date}`;
  if (uuidReport) {
    link = `${config.publicUrl}/report?type=${type}&date=${date}&id=${uuidReport}`;
  }
  console.log(link); // Useful when send in blue is down

  if (!noMail) {
    const data = {
      summary,
      link,
    };
    const title = "Rapport de mise à jour";
    const to = config.reportMailingList.split(",");
    await report.generate(data, title, to, "trainingsUpdateReport");
  }
};

const trainingsUpdater = async ({ withCodePostalUpdate, noUpdatesFilters, uuidReport, argFilters, noMail }) => {
  const filter = noUpdatesFilters
    ? argFilters
      ? JSON.parse(argFilters)
      : {}
    : {
        $or: [
          {
            to_update: true,
          },
          {
            update_error: { $ne: null },
          },
        ],
      };

  const idsUnPublishedToSkip = await managedUnPublishedRcoFormation();
  const idFilter = { cle_ministere_educatif: { $nin: idsUnPublishedToSkip } };
  const activeFilterTmp = { ...filter, ...idFilter }; // warn:  won't work if filter contain cle_ministere_educatif key

  let allIds = await Formation.distinct("cle_ministere_educatif", activeFilterTmp);
  const activeFilter = { cle_ministere_educatif: { $in: allIds } }; // Avoid issues when the updater modifies a field which is in the filters

  await SandboxFormation.deleteMany({});

  const result = await updater.run(activeFilter, withCodePostalUpdate);

  console.log(
    `Results total, invalidFormations: ${result.invalidFormations.length}, updatedFormations: ${result.updatedFormations.length}, noUpdatedFormations: ${result.noUpdatedFormations.length}`
  );

  await createReport({ ...result, unpublishedFormations: idsUnPublishedToSkip }, uuidReport, noMail);
  await createReportNewDiplomeGrandAge(result.formationsGrandAge, uuidReport, noMail);

  await SandboxFormation.deleteMany({});
};

module.exports = trainingsUpdater;

if (process.env.standalone) {
  runScript(async () => {
    const args = process.argv.slice(2);
    const withCodePostalUpdate = args.includes("--withCodePostal");
    const noUpdatesFilters = args.includes("--noUpdatesFilters");
    const uuidReport = args.find((arg) => arg.startsWith("--uuidReport"))?.split("=")?.[1];
    const argFilters = args.find((arg) => arg.startsWith("--filters"))?.split("=")?.[1];
    const noMail = args.includes("--noMail");
    await trainingsUpdater({ withCodePostalUpdate, noUpdatesFilters, uuidReport, argFilters, noMail });
  });
}
