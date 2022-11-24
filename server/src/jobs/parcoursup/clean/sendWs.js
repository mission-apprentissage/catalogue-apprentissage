const { Formation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { cursor } = require("../../../common/utils/cursor");
const { updateFormation } = require("../export/parcoursupApi");
const ObjectsToCsv = require("objects-to-csv");

const run = async ({ limit, skip, file, clean } = { limit: 0, skip: 0, clean: false }) => {
  const results = [];
  try {
    await cursor(
      Formation.find({ parcoursup_id: { $ne: undefined } })
        .limit(limit)
        .skip(skip),
      async ({ cle_ministere_educatif, parcoursup_id, parcoursup_mefs_10, rncp_code, cfd, uai_formation }) => {
        const [{ mef10: mef } = { mef10: null }] = parcoursup_mefs_10 ?? [];

        const toSend = {
          user: null,
          g_ta_cod: Number(parcoursup_id),
          rncp: rncp_code ? [Number(rncp_code.replace("RNCP", ""))] : [],
          cfd,
          uai: uai_formation,
          rco: cle_ministere_educatif,
          mef: mef ? Number(mef) : null,
        };

        const index = results.length;

        try {
          await updateFormation(toSend);
          results[index] = {
            response: "OK",
            ...toSend,
            error: null,
          };
        } catch (err) {
          results[index] = {
            response: "KO",
            ...toSend,
            error: { msg: err.response.data, status: err.response.status },
          };

          if (clean) {
            /* On dés-associe les formations PSUP et catalogue en cas d'erreur du WS */
            await Formation.updateOne({ cle_ministere_educatif }, { parcoursup_id: null });
          }
        }

        console.log(results[index]);
      }
    );
  } catch (err) {
    logger.error(err);
  }

  logger.info(results);

  const csv = new ObjectsToCsv(results);

  // Return the CSV file as string:
  console.log(await csv.toString());

  if (file) {
    // Save to file:
    await csv.toDisk(file);
  }
};

if (process.env.standalone) {
  runScript(async () => {
    logger.info(" -- Start formation parcoursup_id sendWs -- ");
    const args = process.argv.slice(2);

    // Limite de formation envoyée sur le WS de maj Parcoursup
    const limit = args.find((arg) => arg.startsWith("--limit"))?.split("=")?.[1];
    // Nombre de formation à skip avant d'appliquer la limite
    const skip = args.find((arg) => arg.startsWith("--skip"))?.split("=")?.[1];
    // Nom du fichier csv dans lequel on écrira les résultats
    const file = args.find((arg) => arg.startsWith("--file"))?.split("=")?.[1];
    // Option pour dés-associer les parcoursup_id en cas d'erreur du WS (à n'utiliser qu'une fois les cas d'erreur analysés)
    const clean = !!args.find((arg) => arg.startsWith("--clean"));

    await run({ limit: limit ? Number(limit) : 0, skip: skip ? Number(skip) : 0, file, clean });

    logger.info(" -- End formation parcoursup_id sendWs -- ");
  });
}
