const { getEtablissementCoverage } = require("../../logic/controller/coverage");
const { paginator } = require("../common/utils/paginator");
const { PsFormation } = require("../../common/model");

module.exports = async () => {
  await paginator(
    PsFormation,
    { filter: { matching_type: { $ne: null } }, lean: true },
    async ({ matching_mna_formation, _id }) => {
      let match = await getEtablissementCoverage(matching_mna_formation);

      if (!match) return;

      await PsFormation.findByIdAndUpdate(_id, {
        matching_mna_etablissement: match,
      });
    }
  );
};
