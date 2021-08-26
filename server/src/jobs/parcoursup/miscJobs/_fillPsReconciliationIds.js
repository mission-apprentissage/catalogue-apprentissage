const { runScript } = require("../../scriptWrapper");
const { paginator } = require("../../../common/utils/paginator");
const { PsReconciliation, PsFormation } = require("../../../common/model");

runScript(async () => {
  await migrate();
});

async function migrate() {
  await PsReconciliation.updateMany({}, { $set: { ids_parcoursup: [] } });

  await paginator(
    PsFormation,
    { filter: { id_reconciliation: { $ne: null } }, limit: 300, lean: true },
    async ({ id_parcoursup, id_reconciliation }) => {
      let matching = await PsReconciliation.findOne({ _id: id_reconciliation });

      await PsReconciliation.findByIdAndUpdate(
        id_reconciliation,
        {
          ids_parcoursup: [...matching._doc.ids_parcoursup, id_parcoursup],
        },
        {
          new: true,
        }
      );
    }
  );
}
