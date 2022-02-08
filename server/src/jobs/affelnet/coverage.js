const { getAffelnetCoverage } = require("../../logic/controller/coverage");
const { paginator } = require("../../common/utils/paginator");
const { AffelnetFormation, Formation } = require("../../common/model");
const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");
const { reconciliationAffelnet } = require("../../logic/controller/reconciliation");

const formation = async () => {
  await paginator(
    AffelnetFormation,
    { filter: { code_mef: { $nin: [null, "AFFECTATION"] }, uai: { $ne: null } }, limit: 100 },
    async (formation) => {
      let match = await getAffelnetCoverage(formation);

      if (!match) return;

      formation.matching_type = match.strength;
      formation.matching_mna_formation = match.matching;
      await formation.save();

      if (formation.matching_mna_formation?.length === 1 && Number(formation.matching_type) >= 3) {
        await reconciliationAffelnet(formation);
      }
    }
  );
};

const afCoverage = async () => {
  logger.info("Start Affelnet coverage");

  // reset matching first
  await AffelnetFormation.updateMany(
    {},
    {
      $set: {
        matching_type: null,
        matching_mna_formation: [],
      },
    }
  );

  // reset "publié" to "hors périmètre"
  await Formation.updateMany({ affelnet_statut: "publié" }, { $set: { affelnet_statut: "hors périmètre" } });

  logger.info("Start formation coverage");
  await formation();

  logger.info("End Affelnet coverage");
};

module.exports = afCoverage;

if (process.env.standalone) {
  runScript(async () => {
    await afCoverage();
  });
}
