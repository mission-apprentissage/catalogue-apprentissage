const logger = require("../../common/logger");
const diff = require("./diff/diff");

const { runScript } = require("../scriptWrapper");

const rcoDiff = async () => {
  try {
    logger.info(" -- Start of RCO formations diff -- ");

    await diff.run();

    logger.info(" -- End of RCO formations diff -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = rcoDiff;

if (process.env.standalone) {
  runScript(async () => {
    await rcoDiff();
  });
}
