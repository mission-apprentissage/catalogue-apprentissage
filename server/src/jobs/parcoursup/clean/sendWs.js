const { Formation } = require("../../../common/models");
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { cursor } = require("../../../common/utils/cursor");
const { updateFormation } = require("../parcoursupApi");
const ObjectsToCsv = require("objects-to-csv");

const run = async ({ filter, limit, skip, file, clean } = { limit: 0, skip: 0, clean: false }) => {
  console.log(filter);
  const results = [];
  try {
    await cursor(
      Formation.find({ parcoursup_id: { $ne: null }, ...filter })
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
  } catch (error) {
    logger.error({ type: "job" }, error);
  }

  // logger.info(results);

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
    logger.info({ type: "job" }, " -- Start formation parcoursup_id sendWs -- ");
    const args = process.argv.slice(2);

    // Filtre appliquée aux formations envoyées
    const filter = args.find((arg) => arg.startsWith("--filter"))?.split("=")?.[1];
    // Limite de formations envoyées sur le WS de maj Parcoursup
    const limit = args.find((arg) => arg.startsWith("--limit"))?.split("=")?.[1];
    // Nombre de formations à skip avant d'appliquer la limite
    const skip = args.find((arg) => arg.startsWith("--skip"))?.split("=")?.[1];
    // Nom du fichier csv dans lequel on écrira les résultats
    const file = args.find((arg) => arg.startsWith("--file"))?.split("=")?.[1];
    // Option pour dés-associer les parcoursup_id en cas d'erreur du WS (à n'utiliser qu'une fois les cas d'erreur analysés)
    const clean = !!args.find((arg) => arg.startsWith("--clean"));

    console.log(filter);

    await run({
      filter: JSON.parse(filter),
      limit: limit ? Number(limit) : 0,
      skip: skip ? Number(skip) : 0,
      file,
      clean,
    });

    logger.info({ type: "job" }, " -- End formation parcoursup_id sendWs -- ");
  });
}
