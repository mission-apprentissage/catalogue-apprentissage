const { getAffelnetCoverage, getEtablissementCoverage } = require("../../logic/controller/coverage");
const { paginator } = require("../common/utils/paginator");
const { AfFormation, Etablissement } = require("../../common/model");
const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");

const updateMatchedFormation = async (match) => {
  let { strengh, matching, _id } = match;

  await AfFormation.findByIdAndUpdate(_id, {
    matching_type: strengh,
    matching_mna_formation: matching,
  });
};

const formation = async () => {
  await paginator(AfFormation, { filter: { code_cfd: { $ne: null } }, lean: true, limit: 100 }, async (formation) => {
    let match = await getAffelnetCoverage(formation);

    if (!match) return;

    await updateMatchedFormation(match);
  });
};

const etablissement = async () => {
  await paginator(
    AfFormation,
    { filter: { matching_type: { $ne: null } }, lean: true, limit: 50 },
    async ({ matching_mna_formation, _id }) => {
      let match = await getEtablissementCoverage(matching_mna_formation);

      if (!match) return;

      await AfFormation.findByIdAndUpdate(_id, {
        matching_mna_etablissement: match,
      });
    }
  );
};

module.exports = { formation, etablissement };

runScript(async () => {
  logger.info("Start Affelent coverage");
  let check = await Etablissement.find({}).countDocuments();

  if (check === 0) {
    logger.error("No establishment found, please import collection first");

    return;
  }

  logger.info("Start formation coverage");
  await formation();

  logger.info("Start etablissement coverage");
  await etablissement();

  logger.info("End Affelent coverage");
});
