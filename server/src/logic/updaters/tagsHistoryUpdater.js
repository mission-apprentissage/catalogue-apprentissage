const { ConvertedFormation } = require("../../common/model/index");

const updateTagsHistory = async (scope) => {
  await ConvertedFormation.updateMany(
    { [`${scope}_history`]: null },
    {
      $set: {
        [`${scope}_history`]: [],
      },
    }
  );
  await ConvertedFormation.updateMany({}, [
    {
      $set: {
        [`${scope}_history`]: {
          $concatArrays: [`$${scope}_history`, [{ [scope]: `$${scope}`, date: Date.now() }]],
        },
      },
    },
  ]);
};

module.exports = { updateTagsHistory };
