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
      formation.uai_formation = pendingFormation.uai_formation;
      await formation.save();
    }
  });
};

runScript(async () => {
  await run();
});
