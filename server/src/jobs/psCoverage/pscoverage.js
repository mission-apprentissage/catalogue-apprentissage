const { getParcoursupCoverage } = require("../../logic/controller/coverage");
const { paginator } = require("../common/utils/paginator");
const { PsFormation } = require("../../common/model");

const updateMatchedFormation = async (matching) => {
  let {
    formation: { _id },
  } = matching;

  let { matching_strength, data } = matching.match[0];

  await PsFormation.findByIdAndUpdate(_id, { matching_type: matching_strength, matching_mna_formation: data });
};

module.exports = async () => {
  await paginator(PsFormation, { filter: { code_cfd: { $ne: null } }, lean: true, limit: 10 }, async (formation) => {
    let match = await getParcoursupCoverage(formation);

    if (!match) return;

    let payload = { formation, match };

    await updateMatchedFormation(payload);
  });
};
