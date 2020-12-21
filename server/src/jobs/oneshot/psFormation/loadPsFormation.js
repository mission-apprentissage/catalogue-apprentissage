const path = require("path");
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { PsFormation } = require("../../../common/model");
const { asyncForEach } = require("../../../common/utils/asyncUtils");

if (process.env.standalone) {
  runScript(async () => {
    logger.info("Coverage load job START");

    const data = path.resolve(__dirname, "../../../../data/psformation/psformation-fullmatched-prod.json");

    await asyncForEach(data, async (item) => {
      try {
        await PsFormation.create(item);
      } catch (error) {
        logger.error(error);
      }
    });

    logger.info("Coverage load job END");
  });
}
