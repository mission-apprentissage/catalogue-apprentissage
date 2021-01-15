const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { PsFormation } = require("../../../common/model");
const { runScript } = require("../../scriptWrapper");
const logger = require("../../../common/logger");

const run = async () => {
  const formations = await PsFormation.find({}).lean();

  await asyncForEach(formations, async ({ _id, matching_mna_formation, matching_mna_etablissement, ...data }) => {
    await matching_mna_formation.forEach(() => {
      return {};
    });

    await matching_mna_etablissement.forEach(() => {
      return {};
    });

    await PsFormation.findByIdAndUpdate(_id, { matching_mna_etablissement, matching_mna_formation, data });
  });
};

if (process.env.standalone) {
  runScript(async () => {
    logger.info(" -- Start cleanup psformation -- ");

    await run();

    logger.info(" -- End cleanup psformation -- ");
  });
}
