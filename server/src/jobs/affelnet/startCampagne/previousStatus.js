const { Formation } = require("../../../common/models");
const { cursor } = require("../../../common/utils/cursor");

const run = async () => {
  await cursor(Formation.find({}), async ({ _id, affelnet_statut }) => {
    await Formation.updateOne({ _id }, { affelnet_previous_statut: affelnet_statut });
  });
};

module.exports = {
  run,
};
