const logger = require("../../common/logger");
const updater = require("./updater/updater");
const { MnaFormation, ConvertedFormation } = require("../../common/model/index");

const { runScript } = require("../scriptWrapper");

const trainingsUpdater = async () => {
  try {
    logger.info(" -- Start of training updater -- ");

    await updater.run(ConvertedFormation);

    await updater.run(MnaFormation);

    logger.info(" -- End of training updater -- ");
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
