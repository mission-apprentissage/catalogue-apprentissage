const psPerimetre = require("./perimetre");
const { psCoverage } = require("./coverage");
const parcoursupExport = require("./export");
const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");

const parcoursupJobs = async () => {
  try {
    logger.info(`Start Parcoursup jobs`);

    await psPerimetre();
    await psCoverage();

    if (process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_EXPORT_ENABLED === "true") {
      await parcoursupExport.run();
    }

    logger.info(`End Parcoursup jobs`);
  } catch (error) {
    logger.error(error);
  }
};

module.exports = parcoursupJobs;

if (process.env.standaloneJobs) {
  runScript(async () => {
    await parcoursupJobs();
  });
}
