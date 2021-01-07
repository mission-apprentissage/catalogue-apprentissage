const path = require("path");
const logger = require("../../../common/logger");
const updateMatching = require("./updateMatching");
const bulkUpdate = require("./bulkUpdate");
const { runScript } = require("../../scriptWrapper");
const updateCreate = require("./updateCreate");

const matching6 = async () => {
  try {
    const partOne = path.resolve(__dirname, "./assets/matching-6-create-ABT.xlsx");
    const partTwo = path.resolve(__dirname, "./assets/matching-6-create-APT.xlsx");
    await updateMatching(partOne);
    await updateMatching(partTwo);
  } catch (err) {
    logger.error(err);
  }
};

const matchingCreate = async (catalogue) => {
  try {
    const partOne = path.resolve(__dirname, "./assets/matching-6-create-ABT.xlsx");
    const partTwo = path.resolve(__dirname, "./assets/matching-6-create-APT.xlsx");
    await updateCreate(catalogue, partOne);
    await updateCreate(catalogue, partTwo);
  } catch (error) {
    logger.error(error);
  }
};

if (process.env.standalone) {
  runScript(async ({ catalogue }) => {
    logger.info(" -- Start oneshot psformation -- ");

    await matching6();
    await bulkUpdate();
    await matchingCreate(catalogue);

    logger.info(" -- End oneshot psformation -- ");
  });
}
