const logger = require("../../../../common/logger");
const { mnaFormationUpdater } = require("../../../../logic/updaters/mnaFormationUpdater");
const { detectNewDiplomeGrandAge } = require("../../../../logic/controller/diplomes-grand-age");
const { RcoFormation, Formation } = require("../../../../common/model/index");

const run = async (filter = {}, withCodePostalUpdate = false) => {
  return await performUpdates(filter, withCodePostalUpdate);
};

const performUpdates = async (filter = {}, withCodePostalUpdate = false) => {
  const invalidFormations = [];
  const updatedFormations = [];
  const noUpdatedFormations = [];
  const formationsGrandAge = [];
  const cfdInfosCache = new Map();

  Formation.pauseAllMongoosaticHooks();

  const sort = {
    to_update: -1,
  };
  const cursor = Formation.find(filter).sort(sort).lean().cursor();
  const total = await Formation.countDocuments(filter);
  let index = 0;

  for await (const formation of cursor) {
    if (index % 5000 === 0) {
      console.log(`updating formation ${index}/${total}`);
    }
    index += 1;

    const cfdInfoCache = cfdInfosCache.get(formation.cfd) || null;
    const { updates, formation: updatedFormation, error, cfdInfo } = await mnaFormationUpdater(formation, {
      // no need to check cp info in trainingsUpdater since it was successfully done once at converter
      withCodePostalUpdate: formation.to_update === true || withCodePostalUpdate,
      cfdInfo: cfdInfoCache,
    });

    if (cfdInfo && !cfdInfoCache) {
      cfdInfosCache.set(formation.cfd, cfdInfo);
    }

    const resultGrandAge = detectNewDiplomeGrandAge(formation);
    if (resultGrandAge) {
      formationsGrandAge.push(resultGrandAge);
    }

    if (error) {
      formation.update_error = error;

      // unpublish in case of errors
      if (formation.published === true) {
        formation.published = false;
        // flag rco formation as not converted so that it retries during nightly jobs
        await RcoFormation.findOneAndUpdate(
          { cle_ministere_educatif: formation.cle_ministere_educatif },
          { converted_to_mna: false }
        );
      }

      await Formation.findOneAndUpdate({ _id: formation._id }, formation, { new: true });
      invalidFormations.push({
        id: formation._id,
        cle_ministere_educatif: formation.cle_ministere_educatif,
        cfd: formation.cfd,
        error,
      });
      continue;
    }

    if (!updates) {
      noUpdatedFormations.push({
        id: formation._id,
        cle_ministere_educatif: formation.cle_ministere_educatif,
      });
      continue;
    }

    try {
      updatedFormation.update_error = null;
      updatedFormation.to_update = false;
      updatedFormation.last_update_at = Date.now();
      await Formation.findOneAndUpdate({ _id: formation._id }, updatedFormation, { new: true });
      updatedFormations.push({
        id: formation._id,
        cle_ministere_educatif: formation.cle_ministere_educatif,
        cfd: formation.cfd,
        updates: JSON.stringify(updates),
      });
    } catch (error) {
      logger.error(error);
    }
  }

  return { invalidFormations, updatedFormations, noUpdatedFormations, formationsGrandAge };
};

module.exports = { run, performUpdates };
