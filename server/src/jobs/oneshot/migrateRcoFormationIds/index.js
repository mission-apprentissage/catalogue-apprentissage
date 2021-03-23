const { runScript } = require("../../scriptWrapper");
const { RcoFormation } = require("../../../common/model");
const { paginator } = require("../../common/utils/paginator");

runScript(async () => {
  await paginator(RcoFormation, { filter: {}, lean: true }, async (formation) => {
    await RcoFormation.findOneAndUpdate(
      { _id: formation.id },
      {
        id_rco_formation: `${formation.id_formation}|${formation.id_action}|${formation.id_certifinfo}`,
      },
      {
        new: true,
      }
    );
  });
});
