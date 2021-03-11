const { reconciliationAffelnet } = require("../../logic/controller/reconciliation");
const { paginator } = require("../common/utils/paginator");
const { AfFormation } = require("../../common/model");
const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");

const afReconciliation = async () => {
  try {
    logger.info(`Start affelnet reconciliation`);

    await paginator(
      AfFormation,
      { filter: { matching_mna_formation: { $size: 1 } }, lean: true, limit: 200 },
      async (formation) => await reconciliationAffelnet(formation)
    );

    logger.info(`End affelnet reconciliation`);
  } catch (error) {
    logger.error(error);
  }
};

module.exports = afReconciliation;

if (process.env.standalone) {
  runScript(async () => {
    await afReconciliation();
  });
}
