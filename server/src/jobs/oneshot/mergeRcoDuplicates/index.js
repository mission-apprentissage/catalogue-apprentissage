const { RcoFormation, ConvertedFormation } = require("../../../common/model/index");
const { runScript } = require("../../scriptWrapper");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const importer = require("../../rcoImporter/importer/importer");
const logger = require("../../../common/logger");
const { diff } = require("deep-object-diff");

const removeDuplicates = async (merged, rest) => {
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
    await merged.save({ validateBeforeSave: false });
    await duplicateToRemove.remove();
  });
};

const run = async ({ runOnConverted = true } = {}) => {
  if (runOnConverted) {
    const result = await ConvertedFormation.aggregate([
      { $group: { _id: "$id_rco_formation", count: { $sum: 1 } } },
      { $match: { count: { $gte: 2 } } },
    ]);

    console.log(result);
    await asyncForEach(result, async ({ _id }, index) => {
      logger.info(`Merge duplicates progress : ${index}/${result.length}`);
      const [merged, ...rest] = await ConvertedFormation.find({ id_rco_formation: _id });
      if (rest.length === 0) {
        return;
      }

      await removeDuplicates(merged, rest);
    });
    return;
  }

  const distinctIds = [];
  const duplicates = [];

  let offset = 0;
  let limit = 100;
  let computed = 0;
  let nbFormations = 10;

  while (computed < nbFormations) {
    let { docs, total } = await RcoFormation.paginate({}, { offset, limit });
    nbFormations = total;

    await Promise.all(
      docs.map(async ({ id_formation, id_action, id_certifinfo }) => {
        computed += 1;

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
      })
    );

    offset += limit;

    logger.info(`progress ${computed}/${total}`);
  }

  duplicates.forEach(({ id_formation, id_action, id_certifinfo, count }) => {
    logger.error(`duplicate found for ${id_formation}|${id_action}|${id_certifinfo} = ${count}`);
  });

  // merge duplicates
  await asyncForEach(duplicates, async ({ id_formation, id_action, id_certifinfo }, index) => {
    logger.info(`Merge duplicates progress : ${index}/${duplicates.length}`);
    const [merged, ...rest] = await RcoFormation.find({ id_formation, id_action, id_certifinfo });
    if (rest.length === 0) {
      return;
    }

    await removeDuplicates(merged, rest);
  });
};

runScript(async () => {
  await run();
});
