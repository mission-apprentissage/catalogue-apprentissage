const { runScript } = require("../../scriptWrapper");
const { RcoFormation, ConvertedFormation } = require("../../../common/model");
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

  let rcoFormationNotPublishedIds = await RcoFormation.find({ published: false })
    .select({ id_rco_formation: 1 })
    .lean();
  rcoFormationNotPublishedIds = rcoFormationNotPublishedIds.map((d) => d.id_rco_formation);
  await ConvertedFormation.collection.updateMany(
    {},
    {
      $set: {
        rco_published: true,
      },
    }
  );
  await ConvertedFormation.collection.updateMany(
    { id_rco_formation: { $in: rcoFormationNotPublishedIds } },
    {
      $set: {
        rco_published: false,
      },
    }
  );
});
