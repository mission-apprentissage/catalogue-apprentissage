const { Etablissement } = require("../../../common/model/index");
const { runScript } = require("../../scriptWrapper");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
// const importer = require("../../rcoImporter/importer/importer");
const logger = require("../../../common/logger");
// const { paginator } = require("../../../common/utils/paginator");
const { diff } = require("deep-object-diff");
// const { sum } = require("lodash");
const { uniq, compact } = require("lodash");

const removeDuplicates = async (merged, rest) => {
  await asyncForEach(rest, async (duplicateToRemove) => {
    //let updateInfo = {};
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
      if (
        key === "uai" &&
        (merged.uai === "" || merged.uai === null) &&
        duplicateToRemove.uai !== "" &&
        duplicateToRemove.uai !== null
      ) {
        merged.uai = duplicateToRemove.uai;
      } else {
        merged[key] = duplicateToRemove[key];
      }
    });
    merged.last_update_at = Date.now();

    merged.tags = compact(uniq([...diffMerged.tags, ...diffDuplicate.tags]));

    merged.uais_potentiels = compact(uniq([...diffMerged.uais_potentiels, diffDuplicate.uai]));

    await merged.save({ validateBeforeSave: false });
    await duplicateToRemove.remove();
  });
};

const run = async () => {
  const result = await Etablissement.aggregate([
    { $group: { _id: "$siret", count: { $sum: 1 } } },
    { $match: { count: { $gte: 2 } } },
  ]);

  // console.log(result);
  // console.log(result.length);
  // console.log(sum(result.map((e) => e.count)));
  await asyncForEach(result, async ({ _id }, index) => {
    logger.info(`Merge duplicates progress : ${index}/${result.length}`);
    const [merged, ...rest] = await Etablissement.find({ siret: _id });
    if (rest.length === 0) {
      return;
    }
    await removeDuplicates(merged, rest);
  });
};

runScript(async () => {
  await run();
});
