const { runScript } = require("../../scriptWrapper");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { PsReconciliation, PsFormation2021 } = require("../../../common/model");

runScript(async () => {
  await migrate();
});

async function migrate() {
  await PsReconciliation.updateMany({}, { $set: { ids_parcoursup: [] } });

  const dataset = await PsFormation2021.find({ id_reconciliation: { $ne: null } }).lean();
  console.log(dataset.length);

  await asyncForEach(dataset, async (psFormation2021) => {
    const { _id, id_reconciliation } = psFormation2021;

    let matching = await PsReconciliation.findOne({ _id: id_reconciliation });

    await PsReconciliation.findByIdAndUpdate(
      id_reconciliation,
      {
        ids_parcoursup: [...matching._doc.ids_parcoursup, _id.toString()],
      },
      {
        new: true,
      }
    );
    // await PsReconciliation.findByIdAndUpdate(
    //   id_reconciliation,
    //   {
    //     ids_parcoursup: [],
    //   },
    //   {
    //     new: true,
    //   }
    // );
  });
}
