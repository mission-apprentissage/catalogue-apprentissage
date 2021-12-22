const { getParcoursupCoverage } = require("../../logic/controller/coverage");
const { paginator } = require("../../common/utils/paginator");
const { PsFormation, Formation } = require("../../common/model");
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
    const match = await getParcoursupCoverage(formation);

    let payload;
    if (!match) {
      // remove previous matchs if any
      payload = {
        formation: { ...formation, is_orphan: false },
        match: {
          matching_strength: null,
          data_length: 0,
          data: [],
        },
      };
    } else {
      payload = { formation: { ...formation, is_orphan: false }, match };
    }

    await updateMatchedFormation(payload);
  });
};

const checkPublished = async (filter = {}, limit = 10) => {
  let countValideOrphans = 0;
  let countRejeteOrphans = 0;

  await paginator(PsFormation, { filter, limit }, async (formation) => {
    // case "VALIDE"
    // --> findById check published if yes do nothing, if no delete validated_formation_ids & change VALIDE to A_VERIFIER ?
    if (formation.statut_reconciliation === "VALIDE") {
      const ids = formation.validated_formation_ids;
      const found = await Formation.findOne({ _id: { $in: ids }, published: true });
      if (!found) {
        countValideOrphans += 1;
        formation.is_orphan = true;
      } else {
        formation.is_orphan = false;
      }
      formation.save();
      return;
    }

    // case REJETE
    // --> findById check published if yes do nothing, if NO published in matching, change REJETE to A_VERIFIER ?
    if (formation.statut_reconciliation === "REJETE") {
      const ids = formation.matching_mna_formation.map(({ _id }) => _id);
      const found = await Formation.findOne({ _id: { $in: ids }, published: true });
      if (!found) {
        countRejeteOrphans += 1;
        formation.is_orphan = true;
      } else {
        formation.is_orphan = false;
      }
      formation.save();
    }
  });

  logger.info(`VALIDE without parent : ${countValideOrphans}`);
  logger.info(`REJETE without parent : ${countRejeteOrphans}`);
};

const psCoverage = async () => {
  logger.info("Start Parcoursup coverage");

  PsFormation.pauseAllMongoosaticHooks();

  const filtersCheckPublished = { statut_reconciliation: { $in: ["VALIDE", "REJETE"] } };
  const allIdsCheckPublished = await PsFormation.distinct("_id", { ...filtersCheckPublished });
  const activeFilterCheckPublished = { _id: { $in: allIdsCheckPublished } };

  await checkPublished(activeFilterCheckPublished);

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
