const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const { psImport } = require("./import");
const { psPerimetre } = require("./perimetre");
const parcoursupExport = require("./export");
const { psConsoleStats } = require("./stats");

/**
 * Run Parcoursup Jobs
 */
const parcoursupJobs = async () => {
  try {
    logger.info({ type: "job" }, `PARCOURSUP JOBS ⏳`);

    await psImport();
    await psPerimetre();

    if (process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_EXPORT_ENABLED) {
      await parcoursupExport.run();
    }

    await psConsoleStats();

    logger.info({ type: "job" }, `PARCOURSUP JOBS ✅`);
  } catch (error) {
    logger.error({ type: "job" }, error);
    logger.error({ type: "job" }, `PARCOURSUP JOBS ❌`);
  }
};

module.exports = parcoursupJobs;

if (process.env.standaloneJobs) {
  runScript(async () => {
    await parcoursupJobs();
  });
}
