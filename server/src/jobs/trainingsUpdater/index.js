const cluster = require("cluster");
// const logger = require("../../common/logger");
const updater = require("./updater/updater");
const { runScript } = require("../scriptWrapper");
const { ConvertedFormation, RcoFormation } = require("../../common/model/index");

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

  return rcoFormationNotPublishedIds;
};

const run = async () => {
  if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    const filter = {};
    const limit = 10;
    const args = process.argv.slice(2);
    const withCodePostalUpdate = args?.[0] === "--withCodePostal";

    runScript(async () => {
      const idsToSkip = await managedUnPublishedRcoFormation();
      const idFilter = { id_rco_formation: { $nin: idsToSkip } };
      const activeFilter = { ...filter, ...idFilter }; // FIXEME TODO filter contain id_rco_formation key

      const { pages, total } = await ConvertedFormation.paginate(activeFilter, { limit });
      const halfItems = Math.floor(pages / 2) * 10;

      // Fork workers.
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      let pOrder = {};
      let order = 1;
      for (const id in cluster.workers) {
        pOrder[cluster.workers[id].process.pid] =
          order === 1 ? { offset: 0, maxItems: halfItems } : { offset: halfItems + 10, maxItems: total };
        order++;
        cluster.workers[id].on("message", (message) => {
          console.log(message);
        });
      }

      cluster.on("online", (worker) => {
        console.log("Worker " + worker.process.pid + " is online");
        worker.send({
          from: "master",
          withCodePostalUpdate,
          activeFilter,
          maxItems: pOrder[worker.process.pid].maxItems,
          offset: pOrder[worker.process.pid].offset,
        });
      });

      cluster.on("exit", (worker) => {
        console.log(`worker ${worker.process.pid} died`);
      });
    });
  } else {
    process.on("message", async (message) => {
      runScript(async () => {
        console.log(message);
        const result = await updater.run(
          message.activeFilter,
          message.withCodePostalUpdate,
          10,
          message.maxItems,
          message.offset
        );
        process.send({
          from: process.pid,
          result,
        });
        // eslint-disable-next-line no-process-exit
        process.exit(0);
      });
    });
  }
};

run();
