const logger = require("../../../common/logger");
const converter = require("./converter/converter");

const { runScript } = require("../../scriptWrapper");

const rcoConverter = async (uuidReport = null) => {
  try {
    logger.info(" -- Start of RCO formations converter -- ");

    await converter.run(uuidReport);

    logger.info(" -- End of RCO formations converter -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = rcoConverter;

if (process.env.standalone) {
  runScript(async () => {
    const args = process.argv.slice(2);
    const uuidReport = args.find((arg) => arg.startsWith("--uuidReport"))?.split("=")?.[1];
    await rcoConverter(uuidReport);
  });
}
