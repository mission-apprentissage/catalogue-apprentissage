const { runScript } = require("../scriptWrapper");
const { Formation } = require("../../common/model");
const { asyncForEach } = require("../../common/utils/asyncUtils");
const { getCfdEntree } = require("../../logic/mappers/cfdMapper");

const run = async () => {
  const dataset = await Formation.find({});
  await asyncForEach(dataset, async (formation) => {
    formation.cfd_entree = getCfdEntree(formation.cfd);
    await formation.save();
  });
};

module.exports = { run };

if (process.env.standalone) {
  runScript(async () => {
    await run();
  });
}
