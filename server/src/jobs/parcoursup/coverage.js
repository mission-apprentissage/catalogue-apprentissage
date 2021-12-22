const { getParcoursupCoverage } = require("../../logic/controller/coverage");
const { paginator } = require("../../common/utils/paginator");
const { PsFormation } = require("../../common/model");
const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");
const { diffFormation, buildUpdatesHistory } = require("../../logic/common/utils/diffUtils");

const updateMatchedFormation = async ({ formation: previousFormation, match }) => {
  let statut_reconciliation = "INCONNU";

  if (match.data_length === 1 && match.matching_strength >= "6") {
    statut_reconciliation = "AUTOMATIQUE";
  } else if (match.data_length > 0 && match.data_length <= 3) {
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
    updatedFormation.etat_reconciliation = true;
  }

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

const formationsCoverage = async (filter = {}, limit = 10) => {
  await paginator(PsFormation, { filter, limit, lean: true }, async (formation) => {
    const match = await getParcoursupCoverage(formation, { published: true, tags: "2021" }); // TODO CHECK TAGS

    let payload;
    if (!match) {
      // remove previous matchs if any
      payload = {
        formation,
        match: {
          matching_strength: null,
          data_length: 0,
          data: [],
        },
      };
    } else {
      payload = { formation, match };
    }

    await updateMatchedFormation(payload);
  });
};

const psCoverage = async () => {
  logger.info("Start Parcoursup coverage");

  PsFormation.pauseAllMongoosaticHooks();

  const filters = { statut_reconciliation: { $nin: ["VALIDE", "REJETE"] } };
  const allIds = await PsFormation.distinct("_id", { ...filters });
  const activeFilter = { _id: { $in: allIds } };

  await formationsCoverage(activeFilter);

  PsFormation.startAllMongoosaticHooks();
};

module.exports = { psCoverage };

if (process.env.standalone) {
  runScript(async () => {
    await psCoverage();
  });
}
