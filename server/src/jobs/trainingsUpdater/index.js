const logger = require("../../common/logger");
const updater = require("./updater/updater");

const { runScript } = require("../scriptWrapper");

const trainingsUpdater = async (withCodePostalUpdate = false) => {
  try {
    logger.info(" -- Start of training updater -- ");

    await updater.run({ published: true }, withCodePostalUpdate);

    logger.info(" -- End of training updater -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = trainingsUpdater;

if (process.env.standalone) {
  runScript(async () => {
    const args = process.argv.slice(2);
    const withCodePostalUpdate = args?.[0] === "--withCodePostal";
    await trainingsUpdater(withCodePostalUpdate);
  });
}
