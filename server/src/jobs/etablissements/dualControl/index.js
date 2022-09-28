const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { compare } = require("./comparator");

const dualControl = async () => {
  try {
    logger.info(`Start Etablissements dualControl`);

    await compare();

    logger.info(`End Etablissements dualControl`);
  } catch (error) {
    logger.error(error);
  }
};

module.exports = dualControl;

if (process.env.standaloneJobs) {
  runScript(async () => {
    await dualControl();
  });
}
