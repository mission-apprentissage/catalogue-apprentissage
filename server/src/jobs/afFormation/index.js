const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const coverage = require("./afcoverage");

if (process.env.standalone) {
  runScript(async () => {
    logger.info(`Start affelnet coverage`);

    await coverage();

    logger.info(`End affelnet coverage`);
  });
}
