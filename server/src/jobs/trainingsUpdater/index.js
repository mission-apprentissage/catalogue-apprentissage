const logger = require("../../common/logger");
const updater = require("./updater/updater");

const { runScript } = require("../scriptWrapper");

const trainingsUpdater = async () => {
  try {
    logger.info(" -- Start of Trainings updater -- ");

    await updater.run();

    logger.info(" -- End of Trainings updater -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = trainingsUpdater;

if (process.env.standalone) {
  runScript(async () => {
    await trainingsUpdater();
  });
}
