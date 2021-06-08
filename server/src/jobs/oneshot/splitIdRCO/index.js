const { ConvertedFormation } = require("../../../common/model/index");
const { runScript } = require("../../scriptWrapper");
const { paginator } = require("../../common/utils/paginator");

runScript(async () => {
  await paginator(
    ConvertedFormation,
    {
      filter: { published: true },
      select: { id_rco_formation: 1 },
      limit: 50,
      lean: true,
    },
    async ({ _id, id_rco_formation }) => {
      const parts = id_rco_formation.split("|");
      const id_formation = parts.shift();
      const id_certifinfo = parts.pop();
      const ids_action = parts;
      await ConvertedFormation.findByIdAndUpdate(_id, {
        id_formation,
        id_action: ids_action.join("|"),
        ids_action,
        id_certifinfo,
      });
    }
  );
});
