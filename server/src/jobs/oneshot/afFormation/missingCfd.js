const { getJsonFromXlsxFile } = require("../../../common/utils/fileUtils");
const { AfFormation } = require("../../../common/model");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { runScript } = require("../../scriptWrapper");
const logger = require("../../../common/logger");
const path = require("path");

const run = async () => {
  const filePath = path.resolve(__dirname, "./assets/affelnet-missing-cfd.xlsx");
  let formations = getJsonFromXlsxFile(filePath);

  let count = 0;

  await asyncForEach(formations, async ({ id_mna, code_cfd }) => {
    if (!code_cfd) return;

    await AfFormation.findOneAndUpdate({ id_mna }, { code_cfd });
    count += 1;
  });

  logger.info(`${count} cfd formations mise à jour`);
};

if (process.env.standalone) {
  runScript(async () => {
    logger.info(`Start missing CFD import`);

    await run();

    logger.info(`End missing CFD import`);
  });
}
