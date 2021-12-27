const logger = require("../../../../common/logger");
const { Etablissement } = require("../../../../common/model/index");
const { getEtablissementUpdates } = require("@mission-apprentissage/tco-service-node");

const run = async (filter = {}, options = null) => {
  await performUpdates(filter, options);
};

const performUpdates = async (filter = {}, options = null) => {
  let etablissementServiceOptions = options || {
    withHistoryUpdate: true,
    scope: { siret: true, geoloc: true, conventionnement: true, onisep: true },
  };

  let count = 0;
  const total = await Etablissement.countDocuments(filter);
  let cursor = Etablissement.find(filter).cursor();
  for await (const etablissement of cursor) {
    try {
      const { updates, etablissement: updatedEtablissement, error } = await getEtablissementUpdates(
        etablissement._doc,
        etablissementServiceOptions
      );

      count++;

      if (error) {
        etablissement.update_error = error;
        await Etablissement.findOneAndUpdate({ _id: etablissement._id }, etablissement, { new: true });
        logger.error(`${count}/${total}: Etablissement ${etablissement._id} errored`, error);
      } else if (!updates) {
        // Do nothing
        logger.info(`${count}/${total}: Etablissement ${etablissement._id} nothing to do`);
      } else {
        updatedEtablissement.last_update_at = Date.now();
        await Etablissement.findOneAndUpdate({ _id: etablissement._id }, updatedEtablissement, { new: true });
        logger.info(`${count}/${total}: Etablissement ${etablissement._id} updated`);
      }
    } catch (error) {
      logger.error(error);
    }
  }

  return true;
};

module.exports = { run, performUpdates };
