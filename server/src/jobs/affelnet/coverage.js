const { getAffelnetCoverage } = require("../../logic/controller/coverage");
const { paginator } = require("../../common/utils/paginator");
const { AfFormation } = require("../../common/model");
const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");

const formation = async () => {
  await paginator(AfFormation, { filter: { code_cfd: { $ne: null } }, limit: 100 }, async (formation) => {
    let match = await getAffelnetCoverage(formation);

    if (!match) return;

    formation.matching_type = match.strength;
    formation.matching_mna_formation = match.matching;
    await formation.save();
  });
};

const afCoverage = async () => {
  logger.info("Start Affelnet coverage");

  // reset matching first
  await AfFormation.updateMany(
    {},
    {
      $set: {
        matching_type: null,
        matching_mna_formation: [],
      },
    }
  );

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
