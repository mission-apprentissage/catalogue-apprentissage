const afCoverage = require("./coverage");
const afPerimetre = require("./perimetre");
const afReinitStatus = require("./reinitStatus");
const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const { stats } = require("./stats");

const affelnetJobs = async () => {
  try {
    logger.info(`Start Affelnet jobs`);

    await afReinitStatus(); // Réinitialisation du statut Affelnet des formations 'en attente de publication' lors de la clôture des voeux (1 septembre)
    await afCoverage({});
    await afPerimetre();
    await stats();

    logger.info(`End Affelnet jobs`);
  } catch (error) {
    logger.error(error);
  }
};

module.exports = affelnetJobs;

if (process.env.standaloneJobs) {
  runScript(async () => {
    await affelnetJobs();
  });
}
