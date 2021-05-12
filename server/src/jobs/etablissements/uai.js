const { runScript } = require("../scriptWrapper");
const catalogue = require("../../common/components/catalogue");
const { asyncForEach } = require("../../common/utils/asyncUtils");
const csvToJson = require("convert-csv-to-json-latin");
const logger = require("../../common/logger");

const FILE_PATH = "/data/uploads/uai-siret.csv";

const upsertEtablissements = async () => {
  const lines = csvToJson.getJsonFromCsv(FILE_PATH);

  await asyncForEach(lines, async ({ Uai: uai, Siret: siret }, index) => {
    logger.info(`upsert element ${index + 1}/${lines.length}`);
    const etablissement = await catalogue().getEtablissement({ siret });
    if (!etablissement?._id) {
      const created = await catalogue().createEtablissement({ siret, uai });
      if (!created?._id) {
        logger.error(`Failed to create etablissement ${index + 1}/${lines.length}: `, siret, uai);
      }
    } else {
      await catalogue().updateEtablissement(etablissement._id, { uai });
    }
  });
};

module.exports = upsertEtablissements;

if (process.env.standalone) {
  runScript(async () => {
    await run();
  });
}
