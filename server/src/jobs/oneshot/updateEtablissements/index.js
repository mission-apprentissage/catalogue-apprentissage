const { runScript } = require("../../scriptWrapper");
const catalogue = require("../../../common/components/catalogue_old");
const logger = require("../../../common/logger");
const { asyncForEach } = require("../../../common/utils/asyncUtils");

const run = async () => {
  const allEtablissements = await catalogue().getEtablissements();

  await asyncForEach(allEtablissements, async (item, i, arr) => {
    logger.info(`update all etablissements ${i}/${arr.length}`);
    await catalogue().updateInformation(item._id);
  });
};

runScript(async () => {
  await run();
});
