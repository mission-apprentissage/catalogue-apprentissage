const { RcoFormation, ConvertedFormation } = require("../../../common/model/index");
const { runScript } = require("../../scriptWrapper");
const logger = require("../../../common/logger");

const run = async () => {
  const publishedRco = await RcoFormation.find({ published: true, converted_to_mna: true });
  let count = 0;

  await Promise.all(
    publishedRco.map(async (rcoFormation, index) => {
      const { id_formation, id_action, id_certifinfo } = rcoFormation;
      const notPublishedConverted = await ConvertedFormation.findOne({
        published: false,
        id_rco_formation: `${id_formation}|${id_action}|${id_certifinfo}`,
      }).lean();

      if (notPublishedConverted?.etablissement_reference_published === true) {
        count += 1;
        logger.info(count, {
          id_rco_formation: notPublishedConverted.id_rco_formation,
          update_error: notPublishedConverted.update_error,
        });
        rcoFormation.converted_to_mna = false;
        await rcoFormation.save();
      }
      logger.info(`progress ${index}/${publishedRco.length}`);
    })
  );

  logger.info(`found ${count} formations published in RCO and not in converted`);
};

runScript(async () => {
  await run();
});
