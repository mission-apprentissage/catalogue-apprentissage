const { runScript } = require("../../scriptWrapper");
const { RcoFormation } = require("../../../common/model");
const { paginator } = require("../../common/utils/paginator");

runScript(async () => {
  await paginator(RcoFormation, { filter: {} }, async (formation) => {
    const rcoFormation = formation._doc;
    rcoFormation.id_rco_formation = `${rcoFormation.id_formation}|${rcoFormation.id_action}|${rcoFormation.id_certifinfo}`;
    await formation.save();
  });
});
