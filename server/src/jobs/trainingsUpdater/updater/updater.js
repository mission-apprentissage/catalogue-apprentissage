const logger = require("../../../common/logger");
const { mnaFormationUpdater } = require("../../../logic/updaters/mnaFormationUpdater");
const report = require("../../../logic/reporter/report");
const config = require("config");
const { storeByChunks } = require("../../common/utils/reportUtils");

const run = async (model, filter = {}) => {
  const result = await performUpdates(model, filter);
  await createReport(model, result);
};

const performUpdates = async (model, filter = {}) => {
  const invalidFormations = [];
  const notUpdatedFormations = [];
  const updatedFormations = [];

  let offset = 0;
  let limit = 100;
  let computed = 0;
  let nbFormations = 10;

  while (computed < nbFormations) {
    let { docs, total } = await model.paginate(filter, { offset, limit });
    nbFormations = total;

    await Promise.all(
      docs.map(async (formation) => {
        computed += 1;
        const { updates, formation: updatedFormation, error } = await mnaFormationUpdater(formation._doc);

        if (error) {
          formation.update_error = error;
          await model.findOneAndUpdate({ _id: formation._id }, formation, { new: true });
          invalidFormations.push({ id: formation._id, cfd: formation.cfd, error });
          return;
        }

        if (!updates) {
          notUpdatedFormations.push({ id: formation._id, cfd: formation.cfd });
          return;
        }

        try {
          updatedFormation.last_update_at = Date.now();
          await model.findOneAndUpdate({ _id: formation._id }, updatedFormation, { new: true });
          updatedFormations.push({ id: formation._id, cfd: formation.cfd, updates: JSON.stringify(updates) });
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

const createReport = async (model, { invalidFormations, updatedFormations, notUpdatedFormations }) => {
  const summary = {
    invalidCount: invalidFormations.length,
    updatedCount: updatedFormations.length,
    notUpdatedCount: notUpdatedFormations.length,
  };

  // save report in db
  const date = Date.now();
  const type = "trainingsUpdate";

  await storeByChunks(type, date, summary, "updated", updatedFormations);
  await storeByChunks(type, date, summary, "notUpdated", notUpdatedFormations);
  await storeByChunks(`${type}.error`, date, summary, "errors", invalidFormations);

  const link = `${config.publicUrl}/report?type=${type}&date=${date}`;
  const data = {
    invalid: invalidFormations,
    updated: updatedFormations,
    notUpdated: notUpdatedFormations,
    summary,
    link,
  };
  const title = `[${model.modelName}] Rapport de mise à jour`;
  const to = config.reportMailingList.split(",");
  await report.generate(data, title, to, "trainingsUpdateReport");
};

module.exports = { run, performUpdates };
