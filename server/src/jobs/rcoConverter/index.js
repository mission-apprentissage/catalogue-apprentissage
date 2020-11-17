const logger = require("../../common/logger");
const converter = require("./converter/converter");

const { runScript } = require("../scriptWrapper");

const rcoConverter = async () => {
  try {
    logger.info(" -- Start of RCO formations converter -- ");

    await converter.run();

    logger.info(" -- End of RCO formations converter -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = rcoConverter;

if (process.env.standalone) {
  runScript(async () => {
    await rcoConverter();
  });
}
