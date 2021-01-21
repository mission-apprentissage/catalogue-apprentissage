const logger = require("../../../common/logger");
const { mnaFormationUpdater } = require("../../../logic/updaters/mnaFormationUpdater");
const report = require("../../../logic/reporter/report");
const config = require("config");
const { storeByChunks } = require("../../common/utils/reportUtils");
const { RcoFormation, ConvertedFormation } = require("../../../common/model/index");

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
    let { docs, total } = await ConvertedFormation.paginate(filter, { offset, limit });
    nbFormations = total;

    await Promise.all(
      docs.map(async (formation) => {
        computed += 1;

        const [id_formation, id_action, id_certifinfo] = formation.id_rco_formation.split("|");
        const rcoFormation = await RcoFormation.findOne({ id_formation, id_action, id_certifinfo });
        if (rcoFormation?.published === false) {
          // if rco formation is not published, don't call mnaUpdater
          // since we just want to hide the formation
          await ConvertedFormation.findOneAndUpdate({ _id: formation._id }, { published: false }, { new: true });
          return;
        }

        const { updates, formation: updatedFormation, error } = await mnaFormationUpdater(formation._doc);

        if (error) {
          formation.update_error = error;
          // unpublish in case of errors
          if (formation.published === true) {
            formation.published = false;
            // flag rco formation as not converted so that it retries during nightly jobs
            const [id_formation, id_action, id_certifinfo] = formation.id_rco_formation.split("|");
            await RcoFormation.findOneAndUpdate(
              { id_formation, id_action, id_certifinfo },
              { converted_to_mna: false }
            );
          }
          await ConvertedFormation.findOneAndUpdate({ _id: formation._id }, formation, { new: true });
          invalidFormations.push({ id: formation._id, cfd: formation.cfd, error });
          return;
        }

        if (!updates) {
          notUpdatedFormations.push({ id: formation._id, cfd: formation.cfd });
          return;
        }

        try {
          updatedFormation.last_update_at = Date.now();
          await ConvertedFormation.findOneAndUpdate({ _id: formation._id }, updatedFormation, { new: true });
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

const createReport = async ({ invalidFormations, updatedFormations, notUpdatedFormations }) => {
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
  const title = "Rapport de mise à jour";
  const to = config.reportMailingList.split(",");
  await report.generate(data, title, to, "trainingsUpdateReport");
};

module.exports = { run, performUpdates };
