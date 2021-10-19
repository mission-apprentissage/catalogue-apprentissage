const { Formation } = require("../../common/model/index");

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
    {
      $set: {
        [`${scope}_history`]: {
          $concatArrays: [`$${scope}_history`, [{ [scope]: `$${scope}`, date: new Date() }]],
        },
      },
    },
  ]);
};

module.exports = { updateTagsHistory };
