const { paginator } = require("../../common/utils/paginator");
const { ParcoursupFormation, Formation } = require("../../common/model");
const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");
const { updateParcoursupCoverage } = require("../../logic/updaters/coverageUpdater");

const formationsCoverage = async (filter = {}, limit = 10) => {
  await paginator(ParcoursupFormation, { filter, limit, lean: true }, async (formation) => {
    await updateParcoursupCoverage(formation);
  });
};

const checkPublished = async (filter = {}, limit = 10) => {
  let countValideOrphans = 0;
  let countRejeteOrphans = 0;

  await paginator(ParcoursupFormation, { filter, limit }, async (formation) => {
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

  logger.info({ type: "job" }, `VALIDE without parent : ${countValideOrphans}`);
  logger.info({ type: "job" }, `REJETE without parent : ${countRejeteOrphans}`);
};

const psCoverage = async () => {
  logger.info({ type: "job" }, "Start Parcoursup coverage");

  const filtersCheckPublished = { statut_reconciliation: { $in: ["VALIDE", "REJETE"] } };
  const allIdsCheckPublished = await ParcoursupFormation.distinct("_id", { ...filtersCheckPublished });
  const activeFilterCheckPublished = { _id: { $in: allIdsCheckPublished } };

  await checkPublished(activeFilterCheckPublished);

  const filters = { statut_reconciliation: { $nin: ["VALIDE", "REJETE"] } };
  const allIds = await ParcoursupFormation.distinct("_id", { ...filters });
  const activeFilter = { _id: { $in: allIds } };

  await formationsCoverage(activeFilter);
};

module.exports = { psCoverage };

if (process.env.standalone) {
  runScript(async () => {
    await psCoverage();
  });
}
