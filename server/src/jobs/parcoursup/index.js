const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const { psImport } = require("./import");
const { psPerimetre } = require("./perimetre");
// const { psCoverage } = require("./coverage");
const parcoursupExport = require("./export");
const { psConsoleStats } = require("./stats");

/**
 * Run Parcoursup Jobs
 */
const parcoursupJobs = async () => {
  try {
    logger.info({ type: "job" }, `Start Parcoursup jobs`);

    await psImport();
    await psPerimetre();
    // await psCoverage();

    if (process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_EXPORT_ENABLED) {
      await parcoursupExport.run();
    }

    await psConsoleStats();

    logger.info({ type: "job" }, `End Parcoursup jobs`);
  } catch (error) {
    logger.error(
      {
        type: "job",
      },
      error
    );
  }
};

module.exports = parcoursupJobs;

if (process.env.standaloneJobs) {
  runScript(async () => {
    await parcoursupJobs();
  });
}
