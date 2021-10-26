const { runScript } = require("../scriptWrapper");
const { asyncForEach } = require("../../common/utils/asyncUtils");
const { PsFormation, Formation } = require("../../common/model");

async function update() {
  const dataset = await PsFormation.find({ statut_reconciliation: "VALIDE" }).lean();

  await asyncForEach(dataset, async (psFormation) => {
    const { _id, matching_mna_formation } = psFormation;
    await asyncForEach(matching_mna_formation, async (mnaFormation) => {
      const mnaFormationU = await Formation.findById(mnaFormation._id);
      if (mnaFormationU) {
        mnaFormationU.parcoursup_id = `${_id}`;
        await mnaFormationU.save();
      }
    });
  });
}

module.exports = update;

if (process.env.standalone) {
  runScript(async () => {
    await update();
  });
}
