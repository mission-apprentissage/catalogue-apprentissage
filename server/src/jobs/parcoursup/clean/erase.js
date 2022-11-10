const { Formation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");

const run = async () => {
  try {
    await Formation.updateMany({}, { $unset: { parcoursup_id: "" } });
  } catch (err) {
    logger.error(err);
  }
};

if (process.env.standalone) {
  runScript(async () => {
    logger.info(" -- Start formation parcoursup_id reinitialisation -- ");

    await run();

    logger.info(" -- End formation parcoursup_id reinitialisation -- ");
  });
}
