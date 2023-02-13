const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");

const importer = require("./importer");

const formationsJobs = async () => {
  try {
    logger.info({ type: "job" }, `Start Formations jobs`);

    // Import RCO
    if (process.env.CATALOGUE_APPRENTISSAGE_RCO_IMPORT_ENABLED) {
      console.log("Import RCO enabled, starting...");
      await importer();
    } else {
      console.log("Import RCO disabled, skipping...");
    }

    logger.info({ type: "job" }, `End Formations jobs`);
  } catch (error) {
    logger.error(
      {
        type: "job",
      },
      error
    );
  }
};

module.exports = formationsJobs;

if (process.env.standaloneJobs) {
  runScript(async () => {
    await formationsJobs();
  });
}
