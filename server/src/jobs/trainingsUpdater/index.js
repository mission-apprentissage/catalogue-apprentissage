const cluster = require("cluster");
// const logger = require("../../common/logger");
const updater = require("./updater/updater");
const { runScript } = require("../scriptWrapper");
const { Formation, RcoFormation, SandboxFormation } = require("../../common/model/index");
const { storeByChunks } = require("../../common/utils/reportUtils");
const report = require("../../logic/reporter/report");
const { createReportNewDiplomeGrandAge } = require("../../logic/controller/diplomes-grand-age");
const config = require("config");

const numCPUs = 4;

const managedUnPublishedRcoFormation = async () => {
  // if rco formation is not published, don't call mnaUpdater
  // since we just want to hide the formation

  const rcoFormationNotPublishedIds = await RcoFormation.distinct("id_rco_formation", { published: false });
  await Formation.updateMany(
    { id_rco_formation: { $in: rcoFormationNotPublishedIds } },
    {
      $set: {
        published: false,
        rco_published: false,
        update_error: null,
        to_update: false,
      },
    }
  );

  return rcoFormationNotPublishedIds;
};

const createReport = async (
  { invalidFormations, updatedFormations, noUpdatedFormations, unpublishedFormations },
  uuidReport
) => {
  console.log("Send report");
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

  const data = {
    summary,
    link,
  };
  const title = "Rapport de mise à jour";
  const to = config.reportMailingList.split(",");
  await report.generate(data, title, to, "trainingsUpdateReport");
};

const run = async () => {
  if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    const args = process.argv.slice(2);
    const withCodePostalUpdate = args.includes("--withCodePostal");
    const noUpdatesFilters = args.includes("--noUpdatesFilters");
    const limitArg = args.find((arg) => arg.startsWith("--limit"))?.split("=")?.[1];
    const uuidReport = args.find((arg) => arg.startsWith("--uuidReport"))?.split("=")?.[1];
    const limit = limitArg ? Number(limitArg) : 100;
    const filter = noUpdatesFilters
      ? {}
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

    runScript(async () => {
      const idsUnPublishedToSkip = await managedUnPublishedRcoFormation();
      const idFilter = { id_rco_formation: { $nin: idsUnPublishedToSkip } };
      const activeFilterTmp = { ...filter, ...idFilter }; // FIXEME TODO filter contain id_rco_formation key

      console.log("Filters : ", activeFilterTmp);
      let allIds = await Formation.find(activeFilterTmp, { _id: 1 });
      allIds = allIds.map(({ _id }) => `${_id}`);
      const activeFilter = { _id: { $in: allIds } }; // Avoid issues when the updter modifies a field which is in the filters

      const { pages, total } = await Formation.paginate(activeFilter, { limit });
      const halfItems = Math.floor(pages / numCPUs) * limit;

      console.log(`total: ${total}`, pages, halfItems);

      await SandboxFormation.deleteMany({});

      // Fork workers.
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      let pOrder = {};
      let order = 0;
      let pResult = {};
      for (const id in cluster.workers) {
        switch (order) {
          case 0:
            pOrder[cluster.workers[id].process.pid] = { offset: 0, maxItems: halfItems };
            break;
          case numCPUs - 1:
            pOrder[cluster.workers[id].process.pid] = { offset: halfItems * order, maxItems: total };
            break;
          default:
            pOrder[cluster.workers[id].process.pid] = {
              offset: halfItems * order,
              maxItems: halfItems * (order + 1),
            };
            break;
        }
        pResult[cluster.workers[id].process.pid] = { result: null };

        order++;
        cluster.workers[id].on("message", (message) => {
          console.log(
            `Results send from ${message.from}, invalidFormations: ${message.result.invalidFormations.length}, updatedFormations: ${message.result.updatedFormations.length}, noUpdatedFormations: ${message.result.noUpdatedFormations.length}`
          );
          pResult[message.from].result = message.result;
          cluster.workers[id].send({
            from: "master",
            type: "end",
          });
        });
      }

      console.log(pOrder);

      cluster.on("online", (worker) => {
        console.log("Worker " + worker.process.pid + " is online");
        worker.send({
          from: "master",
          type: "start",
          withCodePostalUpdate,
          activeFilter,
          limit,
          maxItems: pOrder[worker.process.pid].maxItems,
          offset: pOrder[worker.process.pid].offset,
        });
      });
      let countWorkerExist = 1;
      cluster.on("exit", async (worker) => {
        console.log(`worker ${worker.process.pid} died`);
        if (countWorkerExist === numCPUs) {
          const mR = {
            invalidFormations: [],
            updatedFormations: [],
            noUpdatedFormations: [],
            unpublishedFormations: idsUnPublishedToSkip,
          };
          let mFormationsGrandAge = [];
          for (const key in pResult) {
            if (Object.hasOwnProperty.call(pResult, key)) {
              const r = pResult[key].result;
              if (r) {
                mR.invalidFormations = [...mR.invalidFormations, ...r.invalidFormations];
                mR.updatedFormations = [...mR.updatedFormations, ...r.updatedFormations];
                mR.noUpdatedFormations = [...mR.noUpdatedFormations, ...r.noUpdatedFormations];

                mFormationsGrandAge = [...mFormationsGrandAge, ...(r?.formationsGrandAge ?? [])];
              }
            }
          }

          console.log(
            `Results total, invalidFormations: ${mR.invalidFormations.length}, updatedFormations: ${mR.updatedFormations.length}, noUpdatedFormations: ${mR.noUpdatedFormations.length}`
          );

          runScript(async () => {
            try {
              await createReport(mR, uuidReport);
              await createReportNewDiplomeGrandAge(mFormationsGrandAge, uuidReport);
            } catch (error) {
              console.error(error);
            }
            await SandboxFormation.deleteMany({});
            console.log(`Done`);
          });
        } else {
          countWorkerExist += 1;
        }
      });
    });
  } else {
    process.on("message", async (message) => {
      if (message.type === "start") {
        runScript(async () => {
          console.log(process.pid, message);
          if (message.maxItems === 0 && message.offset === 0) {
            process.send({
              from: process.pid,
              result: {
                invalidFormations: [],
                updatedFormations: [],
                noUpdatedFormations: [],
                formationsGrandAge: [],
              },
            });
          } else {
            const result = await updater.run(
              message.activeFilter,
              message.withCodePostalUpdate,
              message.limit,
              message.maxItems,
              message.offset
            );
            process.send({
              from: process.pid,
              result,
            });
          }
        });
      } else if (message.type === "end") {
        // eslint-disable-next-line no-process-exit
        process.exit(0);
      }
    });
  }
};

run();
