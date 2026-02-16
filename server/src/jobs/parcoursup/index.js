const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const { psImport } = require("./import");
const { psPerimetre } = require("./perimetre");
const { run: psExport } = require("./export");
const { psConsoleStats } = require("./stats");
const { Config } = require("../../common/models");

/**
 * Run Parcoursup Jobs
 */
const parcoursupJobs = async () => {
  const config = await Config.findOne();

  try {
    logger.info({ type: "job" }, `PARCOURSUP JOBS ⏳`);

    await psImport();
    await psPerimetre();

    if (config?.parcoursup_export) {
      await psExport();
    }

    await psConsoleStats();

    logger.info({ type: "job" }, `PARCOURSUP JOBS ✅`);
  } catch (error) {
    logger.error({ type: "job" }, error);
    logger.error({ type: "job" }, `PARCOURSUP JOBS ❌`);
  }
};

module.exports = { parcoursupJobs };

if (process.env.standaloneJobs) {
  runScript(
    async () => {
      await parcoursupJobs();
    },
    {
      pauseHooks: "formations",
    }
  );
}
