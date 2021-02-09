const { getAffelnetCoverage } = require("../../logic/controller/coverage");
const { paginator } = require("../common/utils/paginator");
const { AfFormation } = require("../../common/model");
const { reconciliationAffelnet } = require("../../logic/controller/reconciliation");

const updateMatchedFormation = async (match) => {
  let { strengh, matching, _id } = match;

  await AfFormation.findByIdAndUpdate(_id, {
    matching_type: strengh,
    matching_mna_formation: matching,
  });
};

module.exports = async () => {
  await paginator(AfFormation, { filter: { code_cfd: { $ne: null } }, lean: true, limit: 100 }, async (formation) => {
    let match = await getAffelnetCoverage(formation);

    if (!match) return;

    if (match.length === 1) {
      await reconciliationAffelnet(formation, match);
    }

    await updateMatchedFormation(match);
  });
};
