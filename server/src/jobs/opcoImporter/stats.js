const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");
const { ConvertedFormation, MnaFormation } = require("../../common/model/index");

const runStats = async (model) => {
  const formationsCount = await model.countDocuments();
  const formationsAvecOpcoCount = await model.countDocuments({ opcos: { $ne: [] } });
  const formationsSansOpcosCount = await model.countDocuments({ opcos: [] });
  const formationsSansOpcosEtSansCfdCount = await model.countDocuments({
    $and: [{ opcos: [] }, { cfd: { $in: [null, ""] } }],
  });
  const formationsSansOpcosEtAvecCfdCount = await model.countDocuments({
    $and: [{ opcos: [] }, { cfd: { $nin: [null, ""] } }],
  });
  logger.info(`${model.modelName}: ${formationsCount} formations`);
  logger.info(`${model.modelName}: ${formationsAvecOpcoCount} formations avec opcos`);
  logger.info(`${model.modelName}: ${formationsSansOpcosCount} formations sans opcos`);
  logger.info(`${model.modelName}: ${formationsSansOpcosEtSansCfdCount} formations sans opcos et sans cfd`);
  logger.info(`${model.modelName}: ${formationsSansOpcosEtAvecCfdCount} formations sans opcos et avec cfd`);
};

const run = async () => {
  try {
    logger.info(" -- Stats of OPCO Linker -- ");
    await runStats(ConvertedFormation);
    await runStats(MnaFormation);
    logger.info(" -- End Stats of OPCO Linker -- ");
  } catch (err) {
    logger.error(err);
  }
};

runScript(async () => {
  await run();
});
