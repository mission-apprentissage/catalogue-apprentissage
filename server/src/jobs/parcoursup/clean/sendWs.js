const { Formation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { cursor } = require("../../../common/utils/cursor");
// const { delay } = require("../../../common/utils/asyncUtils");
const { updateFormation } = require("../export/parcoursupApi");

const run = async () => {
  const results = [];
  try {
    await cursor(
      Formation.find({ parcoursup_id: { $ne: undefined } }).limit(10),
      async ({ cle_ministere_educatif, parcoursup_id, parcoursup_mefs_10, rncp_code, cfd_entree, uai_formation }) => {
        const [{ mef10: mef } = { mef10: null }] = parcoursup_mefs_10 ?? [];

        const toSend = {
          user: null,
          g_ta_cod: Number(parcoursup_id),
          rncp: rncp_code ? [Number(rncp_code.replace("RNCP", ""))] : [],
          cfd: cfd_entree,
          uai: uai_formation,
          rco: cle_ministere_educatif,
          mef: mef ? Number(mef) : null,
        };

        try {
          await updateFormation(toSend);
          results[results.length] = {
            response: "OK",
            ...toSend,
          };
        } catch (err) {
          console.info(err);
          console.error({ ...toSend, error: err.response });
          results[results.length] = {
            response: "KO",
            ...toSend,
            error: { msg: err.response.data, status: err.response.status },
          };
        }
      }
    );
  } catch (err) {
    logger.error(err);
  }

  logger.info(results);
};

if (process.env.standalone) {
  runScript(async () => {
    logger.info(" -- Start formation parcoursup_id sendWs -- ");

    await run();

    logger.info(" -- End formation parcoursup_id sendWs -- ");
  });
}
