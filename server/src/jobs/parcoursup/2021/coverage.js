const { getParcoursupCoverage, getEtablissementCoverage } = require("../../../logic/controller/coverage");
const { paginator } = require("../../common/utils/paginator");
const { PsFormation2021, Etablissement } = require("../../../common/model");
const { runScript } = require("../../scriptWrapper");
const logger = require("../../../common/logger");
const { reconciliationParcoursup } = require("../../../logic/controller/reconciliation");
const cluster = require("cluster");
const numCPUs = 4;

const updateMatchedFormation = async ({ formation, match }) => {
  let statut_reconciliation = "INCONNU";

  if (match.data_length === 1 && (match.matching_strength === "7" || match.matching_strength === "6")) {
    // AUTO + recon
    statut_reconciliation = "AUTOMATIQUE";
  } else if (match.data_length === 1 && (match.matching_strength === "5" || match.matching_strength === "4")) {
    statut_reconciliation = "A_VERIFIER";
  } else if (match.data_length <= 3) {
    statut_reconciliation = "A_VERIFIER";
  }

  const updatedFormation = await PsFormation2021.findByIdAndUpdate(
    formation._id,
    {
      matching_type: match.matching_strength,
      matching_mna_formation: match.data,
      statut_reconciliation,
    },
    {
      new: true,
    }
  );

  if (statut_reconciliation === "AUTOMATIQUE") {
    await reconciliationParcoursup(updatedFormation, "AUTOMATIQUE");
  }
};

// let count = 0;
// let countMultiple = 0;
const formation = async (filter = {}, limit = 10, maxItems = 100, offset = 0) => {
  await paginator(
    PsFormation2021,
    { filter, limit, maxItems, offset, lean: true, showProgress: false },
    async (formation) => {
      let match = await getParcoursupCoverage(formation, { published: true, tags: "2021" });

      if (!match) return;

      const payload = { formation, match };
      await updateMatchedFormation(payload);
      // if (match.data_length > 1) {
      //   countMultiple++;
      // } else {
      //   count++;
      // }
    }
  );
  // console.log(` ----> ${count}, ${countMultiple}`);
};

const etablissement = async () => {
  await paginator(
    PsFormation2021,
    { filter: { matching_type: { $ne: null } }, lean: true },
    async ({ matching_mna_formation, _id }) => {
      let match = await getEtablissementCoverage(matching_mna_formation);

      if (!match) return;

      await PsFormation2021.findByIdAndUpdate(_id, {
        matching_mna_etablissement: match,
      });
    }
  );
};

const psCoverage = async (filter = {}, limit = 10, maxItems = 100, offset = 0) => {
  logger.info("Start formation coverage");
  await formation(filter, limit, maxItems, offset);
  return "Ok";
};

const run = async () => {
  if (cluster.isMaster) {
    logger.info("Start Parcoursup coverage");

    console.log(`Master ${process.pid} is running`);

    const filters = { statut_reconciliation: { $nin: ["AUTOMATIQUE", "VALIDE", "A_VERIFIER"] } };
    const args = process.argv.slice(2);
    const limitArg = args.find((arg) => arg.startsWith("--limit"))?.split("=")?.[1];
    const limit = limitArg ? Number(limitArg) : 50;

    runScript(async () => {
      const check = await Etablissement.find({}).countDocuments();

      if (check === 0) {
        logger.error("No establishment found, please import collection first");

        return;
      }
      const activeFilter = { ...filters };
      const { pages, total } = await PsFormation2021.paginate(activeFilter, { limit });
      const halfItems = Math.floor(pages / numCPUs) * limit;

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
          console.log(`Results send from ${message.from}`);
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
          // // Merge
          // for (const key in pResult) {
          //   if (Object.hasOwnProperty.call(pResult, key)) {
          //     const r = pResult[key].result;
          //     if (r) {
          //       // MERGING RESULTS
          //     }
          //   }
          // }

          runScript(async () => {
            logger.info("Start etablissement coverage");
            await etablissement();
            logger.info("End Parcoursup coverage");
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
          const result = await psCoverage(message.activeFilter, message.limit, message.maxItems, message.offset);
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
