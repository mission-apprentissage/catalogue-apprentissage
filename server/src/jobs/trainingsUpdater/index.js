const cluster = require("cluster");
// const logger = require("../../common/logger");
const updater = require("./updater/updater");
const { runScript } = require("../scriptWrapper");
const { ConvertedFormation, RcoFormation } = require("../../common/model/index");
const { storeByChunks } = require("../common/utils/reportUtils");
const report = require("../../logic/reporter/report");
const config = require("config");

const numCPUs = 2;

const managedUnPublishedRcoFormation = async () => {
  // if rco formation is not published, don't call mnaUpdater
  // since we just want to hide the formation

  let rcoFormationNotPublishedIds = await RcoFormation.find({ published: false })
    .select({ id_rco_formation: 1 })
    .lean();
  rcoFormationNotPublishedIds = rcoFormationNotPublishedIds.map((d) => d.id_rco_formation);
  await ConvertedFormation.collection.updateMany(
    { id_rco_formation: { $in: rcoFormationNotPublishedIds } },
    {
      $set: {
        published: false,
      },
    }
  );

  const c = await ConvertedFormation.collection.count({ id_rco_formation: { $in: rcoFormationNotPublishedIds } });
  console.log(c);
  const ct = await ConvertedFormation.collection.count({});
  console.log(ct);
  const cx = await ConvertedFormation.collection.count({ id_rco_formation: { $nin: rcoFormationNotPublishedIds } });
  console.log(cx);

  return rcoFormationNotPublishedIds;
};

const createReport = async ({ invalidFormations, updatedFormations, notUpdatedCount }) => {
  console.log("Send report");
  const summary = {
    invalidCount: invalidFormations.length,
    updatedCount: updatedFormations.length,
    notUpdatedCount: notUpdatedCount,
  };

  // save report in db
  const date = Date.now();
  const type = "trainingsUpdate";

  await storeByChunks(type, date, summary, "updated", updatedFormations);
  await storeByChunks(`${type}.error`, date, summary, "errors", invalidFormations);

  const link = `${config.publicUrl}/report?type=${type}&date=${date}`;
  const data = {
    invalid: invalidFormations,
    updated: updatedFormations,
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

    const filter = {};
    const limit = 100;
    const args = process.argv.slice(2);
    const withCodePostalUpdate = args?.[0] === "--withCodePostal";

    runScript(async () => {
      const idsToSkip = await managedUnPublishedRcoFormation();
      const idFilter = { id_rco_formation: { $nin: idsToSkip } };
      const activeFilter = { ...filter, ...idFilter }; // FIXEME TODO filter contain id_rco_formation key

      const { pages, total } = await ConvertedFormation.paginate(activeFilter, { limit });
      const halfItems = Math.floor(pages / 2) * limit;

      // Fork workers.
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      let pOrder = {};
      let order = 1;
      let pResult = {};
      for (const id in cluster.workers) {
        pOrder[cluster.workers[id].process.pid] =
          order === 1 ? { offset: 0, maxItems: halfItems } : { offset: halfItems + limit, maxItems: total };
        pResult[cluster.workers[id].process.pid] = { result: null };
        order++;
        cluster.workers[id].on("message", (message) => {
          console.log(
            `Results send from ${message.from}, invalidFormations: ${message.result.invalidFormations.length}, updatedFormations: ${message.result.updatedFormations.length}, notUpdatedCount: ${message.result.notUpdatedCount}`
          );
          pResult[message.from].result = message.result;
          cluster.workers[id].send({
            from: "master",
            type: "end",
          });
        });
      }

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
        if (countWorkerExist === 2) {
          const mR = {
            invalidFormations: [],
            updatedFormations: [],
            notUpdatedCount: 0,
          };
          for (const key in pResult) {
            if (Object.hasOwnProperty.call(pResult, key)) {
              const r = pResult[key].result;
              if (r) {
                mR.invalidFormations = [...mR.invalidFormations, ...r.invalidFormations];
                mR.updatedFormations = [...mR.updatedFormations, ...r.updatedFormations];
                mR.notUpdatedCount = mR.notUpdatedCount + r.notUpdatedCount;
              }
            }
          }

          console.log(
            `Results total, invalidFormations: ${mR.invalidFormations.length}, updatedFormations: ${mR.updatedFormations.length}, notUpdatedCount: ${mR.notUpdatedCount}`
          );

          runScript(async () => {
            try {
              await createReport(mR);
            } catch (error) {
              console.error(error);
            }
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
        });
      } else if (message.type === "end") {
        // eslint-disable-next-line no-process-exit
        process.exit(0);
      }
    });
  }
};

run();
