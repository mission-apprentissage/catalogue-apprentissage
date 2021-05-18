const { runScript } = require("../../scriptWrapper");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { PsReconciliation, PsFormation2021 } = require("../../../common/model");
// const mongoose = require("mongoose");

runScript(async () => {
  await migrate();
});

async function migrate() {
  const dataset = await PsFormation2021.find({ id_reconciliation: { $ne: null } }).lean();
  console.log(dataset.length);

  await asyncForEach(dataset, async (psFormation2021) => {
    const { id_reconciliation } = psFormation2021; // _id

    // let matching = await PsReconciliation.findOne({ _id: new mongoose.Types.ObjectId(id_reconciliation) });

    // matching._doc.ids_parcoursup = [...matching._doc.ids_parcoursup, _id];

    // matching.save();
    await PsReconciliation.findByIdAndUpdate(
      id_reconciliation,
      {
        ids_parcoursup: [],
      },
      {
        new: true,
      }
    );
  });
}
