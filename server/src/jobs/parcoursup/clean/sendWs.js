const { Formation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { cursor } = require("../../../common/utils/cursor");
// const { delay } = require("../../../common/utils/asyncUtils");
const { updateFormation } = require("../export/parcoursupApi");
const ObjectsToCsv = require("objects-to-csv");

const run = async ({ limit, skip } = { limit: 0, skip: 0 }) => {
  const results = [];
  try {
    await cursor(
      Formation.find({ parcoursup_id: { $ne: undefined } })
        .limit(limit)
        .skip(skip),
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

  (async () => {
    const csv = new ObjectsToCsv(results);

    // Save to file:
    await csv.toDisk("./test.csv");

    // Return the CSV file as string:
    console.log(await csv.toString());
  })();
};

if (process.env.standalone) {
  runScript(async () => {
    logger.info(" -- Start formation parcoursup_id sendWs -- ");
    const args = process.argv.slice(2);

    const limit = args.find((arg) => arg.startsWith("--limit"))?.split("=")?.[1];
    const skip = args.find((arg) => arg.startsWith("--skip"))?.split("=")?.[1];

    await run({ limit: limit ? Number(limit) : 0, skip: skip ? Number(skip) : 0 });

    logger.info(" -- End formation parcoursup_id sendWs -- ");
  });
}
