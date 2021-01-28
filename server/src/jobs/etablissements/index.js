require("dotenv").config();
const { Readable } = require("stream");
const { oleoduc, writeData } = require("oleoduc");
const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const { Etablissement } = require("../../common/model");

runScript(async ({ catalogue }) => {
  let stats = {
    total: 0,
    created: 0,
    failed: 0,
  };

  let etablissements = await catalogue.getEtablissements({ limit: 10000, query: {} });

  logger.info("Deleting all etablissements...");
  await Etablissement.deleteMany({});

  logger.info(`Inserting ${etablissements.length} etablissements...`);
  await oleoduc(
    Readable.from(etablissements),
    writeData(
      async (e) => {
        stats.total++;
        try {
          delete e._id;
          await Etablissement.create(e);
          stats.created++;
        } catch (e) {
          stats.failed++;
          logger.error(e);
        }
      },
      { parallel: 5 }
    )
  );

  return stats;
});
