const { getEtablissementCoverage } = require("../../logic/controller/coverage");
const { paginator } = require("../common/utils/paginator");
const { AfFormation } = require("../../common/model");

module.exports = async () => {
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
