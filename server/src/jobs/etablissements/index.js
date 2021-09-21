const { Etablissement } = require("../../common/model");
const { oleoduc, writeData } = require("oleoduc");
const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");
const { Readable } = require("stream");

const importEtablissements = async (catalogue) => {
  const stats = {
    total: 0,
    created: 0,
    failed: 0,
  };

  logger.info("Deleting all etablissements...");
  await Etablissement.deleteMany({});

  try {
    await catalogue.getEtablissements({ limit: 500, query: {} }, async (chunck) => {
      logger.info(`Inserting ${chunck.length} etablissements...`);
      await oleoduc(
        Readable.from(chunck),
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
    });
    console.log({ stats });
  } catch (e) {
    // stop here if not able to get etablissements (keep existing ones)
    logger.error("Etablissements", e);
    return;
  }
};

module.exports = { importEtablissements };

if (process.env.standalone) {
  runScript(async ({ catalogue }) => {
    logger.info("Start etablissements import");

    try {
      const totalEtablissments = await catalogue.countEtablissements();
      console.log(totalEtablissments);
      if (totalEtablissments > 0) {
        await importEtablissements(catalogue);
      }
    } catch (error) {
      logger.error(error);
    }

    logger.info("End etablissements import");
  });
}
