const { getParcoursupCoverage, getEtablissementCoverage } = require("../../../logic/controller/coverage");
const { paginator } = require("../../common/utils/paginator");
const { PsFormation2021, Etablissement } = require("../../../common/model");
const { runScript } = require("../../scriptWrapper");
const logger = require("../../../common/logger");

const updateMatchedFormation = async (matching) => {
  let {
    formation: { _id },
  } = matching;

  let { matching_strength, data } = matching.match[0];

  await PsFormation2021.findByIdAndUpdate(_id, { matching_type: matching_strength, matching_mna_formation: data });
};

const formation = async () => {
  await paginator(
    PsFormation2021,
    { filter: { code_cfd: { $ne: null } }, lean: true, limit: 50 },
    async (formation) => {
      let match = await getParcoursupCoverage(formation, { published: true, tags: "2021" });

      if (!match) return;

      let payload = { formation, match };

      await updateMatchedFormation(payload);
    }
  );
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

module.exports = { formation, etablissement };

runScript(async () => {
  let check = await Etablissement.find({}).countDocuments();

  await formation();

  if (check === 0) {
    logger.error("No establishment found, please import collection first");

    return;
  }

  await etablissement();
});
