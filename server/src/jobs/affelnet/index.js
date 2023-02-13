const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const { afReinitStatus } = require("./reinitStatus");
// const { afCoverage } = require("./coverage");
const { afPerimetre } = require("./perimetre");
const { afConsoleStats } = require("./stats");

/**
 * Run Affelnet Jobs
 */
const affelnetJobs = async () => {
  try {
    logger.info({ type: "job" }, `Start Affelnet jobs`);

    await afReinitStatus(); // Réinitialisation du statut Affelnet des formations 'en attente de publication' lors de la clôture des voeux (1 septembre)
    // await afCoverage({});
    await afPerimetre();
    await afConsoleStats();

    logger.info({ type: "job" }, `End Affelnet jobs`);
  } catch (error) {
    logger.error(
      {
        type: "job",
      },
      error
    );
  }
};

module.exports = affelnetJobs;

if (process.env.standaloneJobs) {
  runScript(async () => {
    await affelnetJobs();
  });
}
