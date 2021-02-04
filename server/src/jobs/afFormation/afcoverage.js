const { getAffelnetCoverage } = require("../../logic/controller/coverage");
const { paginator } = require("../common/utils/paginator");
const { AfFormation } = require("../../common/model");

const updateMatchedFormation = async (matching) => {
  let { strengh, match, _id } = matching;

  await AfFormation.findByIdAndUpdate(_id, {
    matching_type: strengh,
    matching_mna_formation: match,
  });
};

module.exports = async () => {
  await paginator(AfFormation, { filter: { code_cfd: { $ne: null } }, lean: true, limit: 50 }, async (formation) => {
    let match = getAffelnetCoverage(formation);

    if (!match) return;

    await updateMatchedFormation(match);
  });
};
