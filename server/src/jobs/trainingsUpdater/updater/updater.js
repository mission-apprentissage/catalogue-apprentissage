const logger = require("../../../common/logger");
const { MnaFormation, Report } = require("../../../common/model/index");
const { mnaFormationUpdater } = require("../../../logic/updaters/mnaFormationUpdater");
const report = require("../../../logic/reporter/report");
const config = require("config");

const run = async (filter = {}) => {
  const result = await performUpdates(filter);
  await createReport(result);
};

const performUpdates = async (filter = {}) => {
  const invalidFormations = [];
  const notUpdatedFormations = [];
  const updatedFormations = [];

  let offset = 0;
  let limit = 100;
  let computed = 0;
  let nbFormations = 10;

  while (computed < nbFormations) {
    let { docs, total } = await MnaFormation.paginate(filter, { offset, limit });
    nbFormations = total;

    await Promise.all(
      docs.map(async (mnaFormation) => {
        computed += 1;
        const { updates, formation: updatedFormation, error } = await mnaFormationUpdater(mnaFormation._doc);

        if (error) {
          mnaFormation.update_error = error;
          await MnaFormation.findOneAndUpdate({ _id: mnaFormation._id }, mnaFormation, { new: true });
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
      })
    );

    offset += limit;

    logger.info(`progress ${computed}/${total}`);
  }

  return { invalidFormations, updatedFormations, notUpdatedFormations };
};

const createReport = async ({ invalidFormations, updatedFormations, notUpdatedFormations }) => {
  const summary = {
    invalidCount: invalidFormations.length,
    updatedCount: updatedFormations.length,
    notUpdatedCount: notUpdatedFormations.length,
  };

  // save report in db
  const date = Date.now();
  const type = "trainingsUpdate";
  await new Report({
    type,
    date,
    data: { summary, updated: updatedFormations, notUpdated: notUpdatedFormations },
  }).save();

  await new Report({
    type: `${type}.error`,
    date,
    data: {
      errors: invalidFormations,
    },
  }).save();

  const link = `${config.publicUrl}/report?type=${type}&date=${date}`;
  const data = {
    invalid: invalidFormations,
    updated: updatedFormations,
    notUpdated: notUpdatedFormations,
    summary,
    link,
  };
  const title = "[Mna Formations] Rapport de mise à jour";
  const to = config.reportMailingList.split(",");
  await report.generate(data, title, to, "trainingsUpdateReport");
};

module.exports = { run, performUpdates };
