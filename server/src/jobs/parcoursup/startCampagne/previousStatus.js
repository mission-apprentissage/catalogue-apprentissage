const { Formation } = require("../../../common/models");
const { cursor } = require("../../../common/utils/cursor");

const run = async () => {
  await cursor(Formation.find({}), async ({ _id, parcoursup_statut }) => {
    await Formation.updateOne({ _id }, { parcoursup_previous_statut: parcoursup_statut });
  });
};

module.exports = {
  run,
};
