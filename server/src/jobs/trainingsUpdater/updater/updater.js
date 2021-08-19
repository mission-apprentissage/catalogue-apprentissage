const logger = require("../../../common/logger");
const { mnaFormationUpdater } = require("../../../logic/updaters/mnaFormationUpdater");
const { paginator } = require("../../../common/utils/paginator");
const { RcoFormation, ConvertedFormation } = require("../../../common/model/index");

const run = async (filter = {}, withCodePostalUpdate = false, limit = 10, maxItems = 100, offset = 0) => {
  return await performUpdates(filter, withCodePostalUpdate, limit, maxItems, offset);
};

const performUpdates = async (filter = {}, withCodePostalUpdate = false, limit = 10, maxItems = 100, offset = 0) => {
  const invalidFormations = [];
  const updatedFormations = [];
  const noUpdatedFormations = [];
  const cfdInfosCache = new Map();

  ConvertedFormation.pauseAllMongoosaticHooks();

  await paginator(ConvertedFormation, { filter, limit, maxItems, offset }, async (formation) => {
    const cfdInfoCache = cfdInfosCache.get(formation._doc.cfd) || null;
    const { updates, formation: updatedFormation, error, serviceAvailable = true, cfdInfo } = await mnaFormationUpdater(
      formation._doc,
      {
        // no need to check cp info in trainingsUpdater since it was successfully done once at converter
        withCodePostalUpdate,
        cfdInfo: cfdInfoCache,
      }
    );

    if (cfdInfo && !cfdInfoCache) {
      cfdInfosCache.set(formation._doc.cfd, cfdInfo);
    }

    if (error) {
      formation.update_error = error;

      if (serviceAvailable) {
        // unpublish in case of errors
        // but don't do it if service tco is unavailable
        if (formation.published === true) {
          formation.published = false;
          // flag rco formation as not converted so that it retries during nightly jobs
          await RcoFormation.findOneAndUpdate(
            { id_rco_formation: formation?.id_rco_formation },
            { converted_to_mna: false }
          );
        }
      }

      await ConvertedFormation.findOneAndUpdate({ _id: formation._id }, formation, { new: true });
      invalidFormations.push({
        id: formation._id,
        id_rco_formation: formation.id_rco_formation,
        cfd: formation.cfd,
        error,
      });
      return;
    }

    if (!updates) {
      noUpdatedFormations.push({
        id: formation._id,
        id_rco_formation: formation.id_rco_formation,
      });
      return;
    }

    try {
      updatedFormation.update_error = null;
      updatedFormation.to_update = false;
      updatedFormation.last_update_at = Date.now();
      await ConvertedFormation.findOneAndUpdate({ _id: formation._id }, updatedFormation, { new: true });
      updatedFormations.push({
        id: formation._id,
        id_rco_formation: formation.id_rco_formation,
        cfd: formation.cfd,
        updates: JSON.stringify(updates),
      });
    } catch (error) {
      logger.error(error);
    }
  });

  return { invalidFormations, updatedFormations, noUpdatedFormations };
};

module.exports = { run, performUpdates };
