const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
// const { EtablissementsUpdater } = require("./EtablissementsUpdater");
// const { findAndUpdateSiegeSocial } = require("./EtablissementsUpdater/orphans");
const importer = require("./importer");
// const { findAndUpdateSiegeSocial } = require("./EtablissementsUpdater/orphans");

const etablissementsJobs = async () => {
  try {
    logger.info(`Start Etablissements jobs`);

    await importer();

    logger.info(`End Etablissements jobs`);
  } catch (error) {
    logger.error(error);
  }
};

module.exports = etablissementsJobs;

if (process.env.standaloneJobs) {
  runScript(async () => {
    await etablissementsJobs();
  });
}
