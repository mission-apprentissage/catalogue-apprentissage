const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const { Etablissement } = require("../../common/model/index");

const findAndUpdateSiegeSocial = async () => {
  logger.info(" -- Start of find and update siege social -- ");

  // find orphans of siege social
  const cursor = Etablissement.find({
    published: true,
    siege_social: false,
    etablissement_siege_siret: { $ne: null },
    etablissement_siege_id: null,
  }).cursor();

  for await (const etablissement of cursor) {
    try {
      const existingSiegeSocial = await Etablissement.findOne({ siret: etablissement.etablissement_siege_siret });
      if (existingSiegeSocial) {
        await Etablissement.findOneAndUpdate(
          { _id: etablissement._id },
          { etablissement_siege_id: existingSiegeSocial._id, last_update_at: Date.now() },
          { new: true }
        );
      }
      // else : do nothing because we don't want to create Etablissement for a company which may not be a CFA
    } catch (error) {
      logger.error(error);
    }
  }

  logger.info(" -- End of find and update siege social -- ");

  return true;
};

module.exports = { findAndUpdateSiegeSocial };

if (process.env.run) {
  runScript(async () => {
    await findAndUpdateSiegeSocial();
  });
}
