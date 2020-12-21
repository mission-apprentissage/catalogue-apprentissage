const path = require("path");
const logger = require("../../../common/logger");
const updateMatching = require("./updateMatching");
const bulkUpdate = require("./bulkUpdate");
const { runScript } = require("../../scriptWrapper");

const matching6 = async (catalogue) => {
  try {
    const filePath = path.resolve(__dirname, "./assets/Etablissements_6_20201130.xlsx");
    await updateMatching(catalogue, filePath);
  } catch (err) {
    logger.error(err);
  }
};

const matching4 = async (catalogue) => {
  try {
    const filePath = path.resolve(__dirname, "./assets/Etablissements_4_20201130.xlsx");
    await updateMatching(catalogue, filePath);
  } catch (error) {
    logger.error(error);
  }
};

if (process.env.standalone) {
  runScript(async ({ catalogue }) => {
    logger.info(" -- Start oneshot psformation -- ");

    await matching6(catalogue);
    await matching4(catalogue);
    await bulkUpdate();

    logger.info(" -- End oneshot psformation -- ");
  });
}
