const { RcoFormation, ConvertedFormation } = require("../../../common/model/index");
const { runScript } = require("../../scriptWrapper");
const logger = require("../../../common/logger");
const { asyncForEach } = require("../../../common/utils/asyncUtils");

const run = async () => {
  let count = 0;
  let offset = 0;
  let limit = 100;
  let computed = 0;
  let nbFormations = 10;

  const formationsToInvalidate = [];

  while (computed < nbFormations) {
    let { docs, total } = await RcoFormation.paginate({ published: true, converted_to_mna: true }, { offset, limit });
    nbFormations = total;

    await Promise.all(
      docs.map(async (rcoFormation) => {
        computed += 1;

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
      })
    );

    offset += limit;

    logger.info(`progress ${computed}/${total}`);
  }

  logger.info(`found ${count} formations published in RCO and not in converted`);

  await asyncForEach(formationsToInvalidate, async ({ id_formation, id_action, id_certifinfo }) => {
    await RcoFormation.findOneAndUpdate({ id_formation, id_action, id_certifinfo }, { converted_to_mna: false });
  });
};

runScript(async () => {
  await run();
});
