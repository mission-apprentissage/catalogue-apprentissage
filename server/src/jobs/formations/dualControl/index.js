const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { importer } = require("./importer");
const { compare } = require("./comparator");

const dualControl = async () => {
  try {
    logger.info(" -- Start of dual control -- ");

    const importError = await importer();

    if (!importError) {
      const results = await compare();

      logger.info("results of dual control : ", results);
      console.log("results of dual control : ", results);
    }

    logger.info(" -- End of dual control -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = dualControl;

if (process.env.standaloneJobs) {
  runScript(async () => {
    await dualControl();
  });
}
