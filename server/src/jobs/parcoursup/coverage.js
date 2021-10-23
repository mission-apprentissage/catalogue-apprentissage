const { getParcoursupCoverage } = require("../../logic/controller/coverage");
const { paginator } = require("../../common/utils/paginator");
const { PsFormation } = require("../../common/model");
const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");
// const { reconciliationParcoursup, dereconciliationParcoursup } = require("../../logic/controller/reconciliation"); --------------------------------
const cluster = require("cluster");
const { diffFormation, buildUpdatesHistory } = require("../../logic/common/utils/diffUtils");
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
  const previousFormation = await PsFormation.findById(formation._id).lean();

  let updatedFormation = {
    ...previousFormation,
    matching_type: match.matching_strength,
    matching_mna_formation: match.data,
    statut_reconciliation,
  };

  if (statut_reconciliation === "AUTOMATIQUE") {
    // const reconciliation = await reconciliationParcoursup(updatedFormation, "AUTOMATIQUE");   --------------------------------

    updatedFormation.etat_reconciliation = true;
    // updatedFormation.id_reconciliation = reconciliation._id;   ------------------------------
  }

  // if (   ----------------------      TODO   check if(statuts_history[statuts_history.length-1].from.statut_reconciliation !== statut_reconciliation)
  //   formation.statut_reconciliation === "REJETE" &&
  //   (statut_reconciliation === "A_VERIFIER" || statut_reconciliation === "AUTOMATIQUE")
  // ) {
  //   updatedFormation.matching_rejete_updated = true;
  // }

  // if (
  //   formation.statut_reconciliation === "AUTOMATIQUE" &&
  //   (statut_reconciliation === "A_VERIFIER" || statut_reconciliation === "INCONNU")
  // ) {
  //   // De-Reconcilier
  //   // await dereconciliationParcoursup(updatedFormation);    --------------------------------
  //   updatedFormation.etat_reconciliation = false;
  //   // updatedFormation.id_reconciliation = null;
  // }

  // History
  const { updates, keys } = diffFormation(previousFormation, updatedFormation);
  if (updates) {
    delete updates.matching_mna_formation;
    const statuts_history = buildUpdatesHistory(previousFormation, updates, keys, null, true);

    updatedFormation.statuts_history = statuts_history;
  }

  await PsFormation.findByIdAndUpdate(updatedFormation._id, updatedFormation, {
    overwrite: true,
    upsert: true,
    new: true,
  });
};

const formation = async (filter = {}, limit = 10, maxItems = 100, offset = 0) => {
  PsFormation.pauseAllMongoosaticHooks();
  await paginator(
    PsFormation,
    { filter, limit, maxItems, offset, lean: true, showProgress: false },
    async (formation) => {
      let match = await getParcoursupCoverage(formation, { published: true, tags: "2021" }); // TO CHECK TAGS

      if (!match) return;

      const payload = { formation, match };
      await updateMatchedFormation(payload);
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

    // const filters = { statut_reconciliation: { $nin: ["AUTOMATIQUE", "VALIDE", "A_VERIFIER"] } };
    const filters = { statut_reconciliation: { $nin: ["VALIDE", "REJETE"] } };
    const args = process.argv.slice(2);
    const limitArg = args.find((arg) => arg.startsWith("--limit"))?.split("=")?.[1];
    const limit = limitArg ? Number(limitArg) : 50;

    runScript(async () => {
      let activeFilter = { ...filters };
      const { pages, total } = await PsFormation.paginate(activeFilter, { limit, select: { _id: 1 } });

      const allIds = await PsFormation.find(activeFilter, { _id: 1 }).lean();
      activeFilter = { _id: { $in: allIds.map((f) => f._id) } };
      console.log(allIds.map((f) => f._id).length, total);

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
          runScript(async () => {
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
