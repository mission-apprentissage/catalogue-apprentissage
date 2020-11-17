const logger = require("../../../common/logger");
const { MnaFormation } = require("../../../common/model/index");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { mnaFormationUpdater } = require("../../../logic/updaters/mnaFormationUpdater");

const run = async (filter = {}) => {
  const mnaFormations = await MnaFormation.find(filter);

  await asyncForEach(mnaFormations, async (mnaFormation) => {
    const { isUpdated, formation: updatedFormation } = await mnaFormationUpdater(mnaFormation._doc);

    if (!isUpdated) {
      logger.info(`MnaFormation ${mnaFormation._id} nothing to do`);
      return;
    }

    try {
      updatedFormation.last_update_at = Date.now();
      await MnaFormation.findOneAndUpdate({ _id: mnaFormation._id }, updatedFormation, { new: true });
      logger.info(`MnaFormation ${mnaFormation._id} has been updated`);
    } catch (error) {
      logger.error(error);
    }
  });
};

module.exports = { run };
