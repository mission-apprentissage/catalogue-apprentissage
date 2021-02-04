const { Etablissement } = require("../../common/model");
const { oleoduc, writeData } = require("oleoduc");
const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");
const { Readable } = require("stream");

const importEtablissements = async (catalogue) => {
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

  console.log({ stats });
};

module.exports = { importEtablissements };

if (process.env.standalone) {
  runScript(async ({ catalogue }) => {
    logger.info("Start etablissemnt import");

    await importEtablissements(catalogue);

    logger.info("End etablissemnt import");
  });
}
