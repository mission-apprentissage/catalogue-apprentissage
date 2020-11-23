const logger = require("../../../common/logger");
const hydrater = require("./hydrate");

const { runScript } = require("../../scriptWrapper");

const hydrate = async () => {
  try {
    logger.info(" -- Start hydrate from old -- ");

    await hydrater.run();

    logger.info(" -- End of hydrate from old -- ");
  } catch (err) {
    logger.error(err);
  }
};

runScript(async () => {
  await hydrate();
});
