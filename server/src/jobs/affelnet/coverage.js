const { getAffelnetCoverage, getEtablissementCoverage } = require("../../logic/controller/coverage");
const { paginator } = require("../common/utils/paginator");
const { AfFormation, Etablissement } = require("../../common/model");
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

const etablissement = async () => {
  await paginator(AfFormation, { filter: { matching_type: { $ne: null } }, limit: 50 }, async (formation) => {
    let match = await getEtablissementCoverage(formation.matching_mna_formation);

    if (!match) return;

    formation.matching_mna_etablissement = match;
    await formation.save();
  });
};

const afCoverage = async () => {
  logger.info("Start Affelnet coverage");
  let check = await Etablissement.find({}).countDocuments();

  if (check === 0) {
    logger.error("No establishment found, please import collection first");

    return;
  }

  // reset matching first
  await AfFormation.updateMany(
    {},
    {
      $set: {
        matching_type: null,
        matching_mna_formation: [],
        matching_mna_etablissement: [],
      },
    }
  );

  logger.info("Start formation coverage");
  await formation();

  logger.info("Start etablissement coverage");
  await etablissement();

  logger.info("End Affelnet coverage");
};

module.exports = afCoverage;

if (process.env.standalone) {
  runScript(async () => {
    await afCoverage();
  });
}
