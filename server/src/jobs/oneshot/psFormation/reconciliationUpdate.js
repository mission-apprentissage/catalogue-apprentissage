const { PsFormation, PsReconciliation } = require("../../../common/model");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { runScript } = require("../../scriptWrapper");
const logger = require("../../../common/logger");

if (process.env.standalone) {
  runScript(async () => {
    logger.info("Start mapping...");
    const formations = await PsFormation.find({}).lean();
    logger.info(`${formations.length} à traiter`);

    let count = 0;

    await asyncForEach(formations, async ({ _id, uai_affilie, uai_composante, uai_gestionnaire, code_cfd }) => {
      let found = await PsReconciliation.findOne({
        uai_affilie,
        uai_composante,
        uai_gestionnaire,
        code_cfd,
      });

      if (found) {
        await PsFormation.findByIdAndUpdate(_id, { etat_reconciliation: true });
        count++;
      }
    });

    logger.info(`${count} formations mise à jour`);
  });
}
