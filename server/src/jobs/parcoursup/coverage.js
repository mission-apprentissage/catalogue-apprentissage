const { getParcoursupCoverage } = require("../../logic/controller/coverage");
const { paginator } = require("../../common/utils/paginator");
const { PsFormation } = require("../../common/model");
const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");
// const { reconciliationParcoursup, dereconciliationParcoursup } = require("../../logic/controller/reconciliation"); --------------------------------
const { diffFormation, buildUpdatesHistory } = require("../../logic/common/utils/diffUtils");

const updateMatchedFormation = async ({ formation: previousFormation, match }) => {
  let statut_reconciliation = "INCONNU";

  if (match.data_length === 1 && match.matching_strength >= "6") {
    // AUTO + recon
    statut_reconciliation = "AUTOMATIQUE";
  } else if (match.data_length === 1 && (match.matching_strength === "5" || match.matching_strength === "4")) {
    statut_reconciliation = "A_VERIFIER";
  } else if (match.data_length <= 3) {
    statut_reconciliation = "A_VERIFIER";
  }

  const statutsPsMna = [];
  for (let index = 0; index < match.data.length; index++) {
    const element = match.data[index];
    statutsPsMna.push(element.parcoursup_statut);
  }

  let updatedFormation = {
    ...previousFormation,
    matching_type: match.matching_strength,
    matching_mna_formation: match.data,
    matching_mna_parcoursup_statuts: statutsPsMna,
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

const formation = async (filter = {}, limit = 10) => {
  await paginator(PsFormation, { filter, limit, lean: true }, async (formation) => {
    let match = await getParcoursupCoverage(formation, { published: true, tags: "2021" }); // TO CHECK TAGS

    if (!match) return;

    const payload = { formation, match };
    await updateMatchedFormation(payload);
  });
};

const psCoverage = async () => {
  logger.info("Start Parcoursup coverage");

  const filters = { statut_reconciliation: { $nin: ["VALIDE", "REJETE"] } }; //"AUTOMATIQUE"
  const args = process.argv.slice(2);
  const limitArg = args.find((arg) => arg.startsWith("--limit"))?.split("=")?.[1];
  const limit = limitArg ? Number(limitArg) : 1;

  const allIds = await PsFormation.distinct("_id", { ...filters });
  const activeFilter = { _id: { $in: allIds } };

  await formation(activeFilter, limit);
};

module.exports = psCoverage;

if (process.env.standalone) {
  runScript(async () => {
    await psCoverage();
  });
}
