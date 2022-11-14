const { Formation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { cursor } = require("../../../common/utils/cursor");
const { delay } = require("../../../common/utils/asyncUtils");
const { postFormation } = require("../export/parcoursupApi");

const run = async () => {
  try {
    await cursor(
      Formation.find({ parcoursup_id: { $ne: undefined } }),
      async ({ cle_ministere_educatif, parcoursup_id }) => {
        console.log({ cle_ministere_educatif, parcoursup_id });
        await postFormation({ cle_ministere_educatif, parcoursup_id });
        await delay(500);
      }
    );
  } catch (err) {
    logger.error(err);
  }
};

if (process.env.standalone) {
  runScript(async () => {
    logger.info(" -- Start formation parcoursup_id sendWs -- ");

    await run();

    logger.info(" -- End formation parcoursup_id sendWs -- ");
  });
}
