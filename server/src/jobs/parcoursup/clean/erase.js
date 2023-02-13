const { Formation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");

const run = async () => {
  try {
    await Formation.updateMany({}, { $set: { parcoursup_id: null } });
  } catch (error) {
    logger.error({ type: "job" }, error);
  }
};

if (process.env.standalone) {
  runScript(async () => {
    logger.info({ type: "job" }, " -- Start formation parcoursup_id reinitialisation -- ");

    await run();

    logger.info({ type: "job" }, " -- End formation parcoursup_id reinitialisation -- ");
  });
}
