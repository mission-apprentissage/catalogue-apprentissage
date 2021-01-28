const { RcoFormation, ConvertedFormation } = require("../../../common/model/index");
const { runScript } = require("../../scriptWrapper");
const logger = require("../../../common/logger");
const { paginator } = require("../../common/utils/paginator");
const { asyncForEach } = require("../../../common/utils/asyncUtils");

const run = async () => {
  let count = 0;
  const formationsToInvalidate = [];

  await paginator(
    RcoFormation,
    { filter: { published: true, converted_to_mna: true }, lean: true },
    async (rcoFormation) => {
      const { id_formation, id_action, id_certifinfo } = rcoFormation;
      const foundCount = await ConvertedFormation.countDocuments({
        published: false,
        id_rco_formation: `${id_formation}|${id_action}|${id_certifinfo}`,
        etablissement_reference_published: true,
      });

      if (foundCount > 0) {
        count += 1;
        formationsToInvalidate.push({ id_formation, id_action, id_certifinfo });
      }
    }
  );

  logger.info(`found ${count} formations published in RCO and not in converted`);

  await asyncForEach(formationsToInvalidate, async ({ id_formation, id_action, id_certifinfo }) => {
    await RcoFormation.findOneAndUpdate({ id_formation, id_action, id_certifinfo }, { converted_to_mna: false });
  });
};

runScript(async () => {
  await run();
});
