const logger = require("../../../common/logger");
const { MnaFormation } = require("../../../common/model/index");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { mnaFormationUpdater } = require("../../../logic/updaters/mnaFormationUpdater");
const report = require("../../../logic/reporter/report");
const config = require("config");

const run = async (filter = {}) => {
  const mnaFormations = await MnaFormation.find(filter);
  const result = await performUpdates(mnaFormations);
  await createReport(result);
};

const performUpdates = async (mnaFormations) => {
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
      updatedFormations.push({ id: mnaFormation._id, cfd: mnaFormation.cfd, updates: JSON.stringify(updates) });
    } catch (error) {
      logger.error(error);
    }
  });

  return { invalidFormations, updatedFormations, notUpdatedFormations };
};

const createReport = async ({ invalidFormations, updatedFormations, notUpdatedFormations }) => {
  const summary = {
    invalidCount: invalidFormations.length,
    updatedCount: updatedFormations.length,
    notUpdatedCount: notUpdatedFormations.length,
  };
  const data = { invalid: invalidFormations, updated: updatedFormations, notUpdated: notUpdatedFormations, summary };
  const title = "[Mna Formations] Rapport de mise à jour";
  const to = config.reportMailingList.split(",");
  await report.generate(data, title, to, "trainingsUpdateReport");
};

module.exports = { run, performUpdates };
