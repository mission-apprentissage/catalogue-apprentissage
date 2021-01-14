const path = require("path");
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");

const bulkUpdate = require("./bulkUpdate");
const psFormation = require("./psFormation");
const psReconciliation = require("./psReconciliation");

const reconciliation = async (catalogue) => {
  try {
    const ABT = path.resolve(__dirname, "./assets/matching-6-create-ABT.xlsx");
    const APT = path.resolve(__dirname, "./assets/matching-6-create-APT.xlsx");
    await psReconciliation(catalogue, ABT);
    await psReconciliation(catalogue, APT);
  } catch (error) {
    logger.error(error);
  }
};

const formation = async () => {
  try {
    const ABT = path.resolve(__dirname, "./assets/matching-6-create-ABT.xlsx");
    const APT = path.resolve(__dirname, "./assets/matching-6-create-APT.xlsx");
    await psFormation(ABT);
    await psFormation(APT);
  } catch (error) {
    logger.error(error);
  }
};

if (process.env.standalone) {
  runScript(async ({ catalogue }) => {
    logger.info(" -- Start oneshot psformation -- ");

    await bulkUpdate();
    await formation();
    await reconciliation(catalogue);

    logger.info(" -- End oneshot psformation -- ");
  });
}
