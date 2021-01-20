const { RcoFormation } = require("../../../common/model/index");
const { runScript } = require("../../scriptWrapper");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const importer = require("../../rcoImporter/importer/importer");
const logger = require("../../../common/logger");
const { diff } = require("deep-object-diff");

const run = async () => {
  const distinctIds = [];
  const duplicates = [];

  const rcoFormations = await RcoFormation.find({});

  // find duplicates
  await asyncForEach(rcoFormations, async ({ id_formation, id_action, id_certifinfo }, index) => {
    logger.info(`Find duplicates progress : ${index}/${rcoFormations.length}`);

    const id = `${id_formation}|${id_action}|${id_certifinfo}`;

    if (distinctIds.includes(id)) {
      return;
    }
    distinctIds.push(id);

    const count = await RcoFormation.countDocuments({ id_formation, id_action, id_certifinfo });
    if (count > 1) {
      duplicates.push({ id_formation, id_action, id_certifinfo, count });
      logger.error(`duplicates for ${id} = ${count}`);
    }
  });

  duplicates.forEach(({ id_formation, id_action, id_certifinfo, count }) => {
    logger.error(`duplicate found for ${id_formation}|${id_action}|${id_certifinfo} = ${count}`);
  });

  // merge duplicates
  await asyncForEach(duplicates, async ({ id_formation, id_action, id_certifinfo }, index) => {
    logger.info(`Merge duplicates progress : ${index}/${duplicates.length}`);
    const [merged, ...rest] = await RcoFormation.find({ id_formation, id_action, id_certifinfo });

    await asyncForEach(rest, async (duplicateToRemove) => {
      let updateInfo = {};
      const mergedPojo = merged.toObject();
      const duplicatePojo = duplicateToRemove.toObject();

      /* eslint-disable no-unused-vars */
      const { _id, __v, updates_history, created_at, last_update_at, ...diffMerged } = mergedPojo;

      const {
        _id: _id2,
        __v: __v2,
        updates_history: updates_history2,
        created_at: created_at2,
        last_update_at: last_update_at2,
        ...diffDuplicate
      } = duplicatePojo;

      const compare = diff(diffMerged, diffDuplicate);
      Object.keys(compare).forEach((key) => {
        updateInfo[key] = duplicateToRemove[key];
      });
      mergedPojo.updates_history = mergedPojo.updates_history ?? [];
      merged.updates_history = importer.buildUpdatesHistory(mergedPojo, updateInfo);
      Object.keys(compare).forEach((key) => {
        merged[key] = duplicateToRemove[key];
      });
      merged.last_update_at = Date.now();
      await merged.save();
      await duplicateToRemove.remove();
    });
  });
};

runScript(async () => {
  await run();
});
