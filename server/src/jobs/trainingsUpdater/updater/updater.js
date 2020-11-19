const logger = require("../../../common/logger");
const { MnaFormation } = require("../../../common/model/index");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { mnaFormationUpdater } = require("../../../logic/updaters/mnaFormationUpdater");

const run = async (filter = {}) => {
  const mnaFormations = await MnaFormation.find(filter);

  const invalidFormations = [];
  const notUpdatedFormations = [];
  const updatedFormations = [];

  await asyncForEach(mnaFormations, async (mnaFormation) => {
    const { updates, formation: updatedFormation, error } = await mnaFormationUpdater(mnaFormation._doc);

    if (error) {
      logger.error(`MnaFormation ${mnaFormation._id}/${mnaFormation.cfd} has error`, error);
      invalidFormations.push({ id: mnaFormation._id, cfd: mnaFormation.cfd, error });
      return;
    }

    if (!updates) {
      logger.info(`MnaFormation ${mnaFormation._id} nothing to do`);
      notUpdatedFormations.push({ id: mnaFormation._id, cfd: mnaFormation.cfd });
      return;
    }

    try {
      updatedFormation.last_update_at = Date.now();
      await MnaFormation.findOneAndUpdate({ _id: mnaFormation._id }, updatedFormation, { new: true });
      logger.info(`MnaFormation ${mnaFormation._id} has been updated`);
      updatedFormations.push({ id: mnaFormation._id, cfd: mnaFormation.cfd, updates });
    } catch (error) {
      logger.error(error);
    }
  });

  // TODO generate report
};

module.exports = { run };
