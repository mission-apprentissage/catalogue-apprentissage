const { ConvertedFormation, PendingRcoFormation } = require("../../../common/model");
const { paginator } = require("../../common/utils/paginator");
const { runScript } = require("../../scriptWrapper");

const run = async () => {
  await paginator(ConvertedFormation, { filter: { published: true } }, async (formation) => {
    // check if it was set by user
    const pendingFormation = await PendingRcoFormation.findOne(
      { id_rco_formation: formation.id_rco_formation },
      { uai_formation: 1 }
    ).lean();
    if (pendingFormation) {
      let editedFields = null;
      if (pendingFormation.uai_formation) {
        formation.uai_formation = pendingFormation.uai_formation;
        editedFields = {};
        editedFields.uai_formation = pendingFormation.uai_formation;
      }
      if (pendingFormation.capacite && pendingFormation.capacite !== formation.capacite) {
        formation.capacite = pendingFormation.capacite;
        editedFields = editedFields || {};
        editedFields.capacite = pendingFormation.capacite;
      }

      formation.editedFields = editedFields;
      await formation.save();
    }
  });
};

runScript(async () => {
  await run();
});
