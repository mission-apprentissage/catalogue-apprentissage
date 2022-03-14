const { Formation } = require("../../common/model/index");

// keep 200 days in history (a bit more than 6 month)
const KEEP_HISTORY_DAYS_LIMIT = 200;

const updateTagsHistory = async (scope) => {
  await Formation.updateMany(
    { [`${scope}_history`]: null },
    {
      $set: {
        [`${scope}_history`]: [],
      },
    }
  );

  await Formation.updateMany({}, [
    // extract last status entry in history (before insert new entry)
    { $addFields: { last_status: { $last: `$${scope}_history` } } },
    {
      $set: {
        [`${scope}_history`]: {
          $concatArrays: [`$${scope}_history`, [{ [scope]: `$${scope}`, date: new Date() }]],
        },
        // set last_statut_update_date only if status has changed
        last_statut_update_date: {
          $cond: [{ $ne: [`$${scope}`, `$last_status.${scope}`] }, new Date(), "$last_statut_update_date"],
        },
      },
    },
  ]);

  // keep only the last N entries in history
  await Formation.updateMany(
    {},
    {
      $push: {
        [`${scope}_history`]: {
          $each: [],
          $slice: -KEEP_HISTORY_DAYS_LIMIT,
        },
      },
    }
  );
};

module.exports = { updateTagsHistory };
