const { runScript } = require("../../scriptWrapper");
const { RcoFormation } = require("../../../common/model");
const { asyncForEach } = require("../../../common/utils/asyncUtils");

runScript(async () => {
  const rcoFormations = await RcoFormation.find({});

  await asyncForEach(rcoFormations, async (formation) => {
    const rcoFormation = formation._doc;
    rcoFormation.id_rco_formation = `${rcoFormation.id_formation}|${rcoFormation.id_action}|${rcoFormation.id_certifinfo}`;
    await formation.save();
    console.log(rcoFormation._id);
  });
});
