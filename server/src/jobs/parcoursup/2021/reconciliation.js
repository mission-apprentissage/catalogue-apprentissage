const { paginator } = require("../../common/utils/paginator");
const { PsFormation2021 } = require("../../../common/model");
const { runScript } = require("../../scriptWrapper");
const { reconciliationParcoursup } = require("../../../logic/controller/reconciliation");
const logger = require("../../../common/logger");

const psReconciliation = async () => {
  try {
    logger.info(`Start parcoursup reconciliation`);

    await paginator(
      PsFormation2021,
      { filter: { matching_mna_formation: { $size: 1 } }, lean: true, limit: 200 },
      async (formation) => await reconciliationParcoursup(formation)
    );

    logger.info(`End parcoursup reconciliation`);
  } catch (error) {
    logger.error(error);
  }
};

module.exports = psReconciliation;

if (process.env.standalone) {
  runScript(async () => {
    await psReconciliation();
  });
}
