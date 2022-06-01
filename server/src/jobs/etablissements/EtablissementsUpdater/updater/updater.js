const logger = require("../../../../common/logger");
const { Etablissement } = require("../../../../common/model/index");
const { getEtablissementUpdates } = require("@mission-apprentissage/tco-service-node");
const { isApiEntrepriseUp } = require("../../../../common/utils/apiUtils");

const run = async (filter = {}, options = null) => {
  await performUpdates(filter, options);
};

const performUpdates = async (filter = {}, options = null) => {
  let etablissementServiceOptions = options || {
    scope: { siret: true, geoloc: true, conventionnement: true, onisep: true, cfadock: true },
  };

  if (
    (!etablissementServiceOptions?.scope ||
      Object.keys(etablissementServiceOptions?.scope).length === 0 ||
      etablissementServiceOptions?.scope?.siret) &&
    !(await isApiEntrepriseUp())
  ) {
    logger.warn("API entreprise is down, no updates");
    return;
  }

  let count = 0;
  const total = await Etablissement.countDocuments(filter);
  let cursor = Etablissement.find(filter).lean().cursor();
  for await (const etablissement of cursor) {
    try {
      if (count % 1000 === 0) {
        console.log(`updating etablissement ${count}/${total}`);
      }
      const { updates, etablissement: updatedEtablissement, error } = await getEtablissementUpdates(
        etablissement,
        etablissementServiceOptions
      );

      count++;

      if (error) {
        etablissement.update_error = error;
        await Etablissement.findByIdAndUpdate(etablissement._id, etablissement);
        logger.error(
          `${count}/${total}: Etablissement ${etablissement._id} (siret: ${etablissement?.siret}) errored: ${error}`
        );
      } else if (updates) {
        updatedEtablissement.last_update_at = Date.now();
        await Etablissement.findByIdAndUpdate(etablissement._id, {
          ...updatedEtablissement,
          update_error: null,
        });
        // console.log(`${count}/${total}: Etablissement ${etablissement._id} updated`);
        // logger.info(`${count}/${total}: Etablissement ${etablissement._id} updated`);
      } else {
        await Etablissement.findByIdAndUpdate(etablissement._id, {
          update_error: null,
        });
      }
    } catch (error) {
      logger.error(error);
    }
  }

  return true;
};

module.exports = { run, performUpdates };
