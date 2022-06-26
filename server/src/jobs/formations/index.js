const crypto = require("crypto");
const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const rcoImporter = require("./rcoImporter");
const rcoConverter = require("./rcoConverter");
const trainingsUpdater = require("./trainingsUpdater");
const { isSunday } = require("../../common/utils/dateUtils");

const formationsJobs = async () => {
  try {
    logger.info(`Start Formations jobs`);

    // Import RCO
    let uuidReport;
    if (process.env.CATALOGUE_APPRENTISSAGE_RCO_IMPORT_ENABLED) {
      // rco
      console.log("Import RCO enabled, starting...");
      uuidReport = await rcoImporter();
      if (!uuidReport) {
        uuidReport = crypto.randomBytes(16).toString("hex");
      }
      await rcoConverter(uuidReport);
    } else {
      console.log("Import RCO disabled, skipping...");
    }

    // Updates
    if (!uuidReport) {
      uuidReport = crypto.randomBytes(16).toString("hex");
    }

    await trainingsUpdater({ uuidReport, noUpdatesFilters: true, withCodePostalUpdate: isSunday() });

    logger.info(`End Formations jobs`);
  } catch (error) {
    logger.error(error);
  }
};

module.exports = formationsJobs;

if (process.env.standaloneJobs) {
  runScript(async () => {
    await formationsJobs();
  });
}
