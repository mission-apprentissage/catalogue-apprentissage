const { ConvertedFormation } = require("../../../common/model/index");
const { runScript } = require("../../scriptWrapper");
const { paginator } = require("../../common/utils/paginator");

runScript(async () => {
  await paginator(
    ConvertedFormation,
    {
      filter: { parcoursup_statut_history: { $ne: null }, affelnet_statut_history: { $ne: null } },
      select: { parcoursup_statut_history: 1, affelnet_statut_history: 1 },
      limit: 50,
      lean: true,
    },
    async (formation) => {
      formation.parcoursup_statut_history = formation.parcoursup_statut_history.map((x) => {
        return {
          ...x,
          date: new Date(x.date),
        };
      });

      formation.affelnet_statut_history = formation.affelnet_statut_history.map((x) => {
        return {
          ...x,
          date: new Date(x.date),
        };
      });

      await ConvertedFormation.findByIdAndUpdate(formation._id, formation);
    }
  );
});
