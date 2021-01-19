const { ConvertedFormation } = require("../../../common/model/index");
const { runScript } = require("../../scriptWrapper");

const run = async () => {
  await ConvertedFormation.updateMany(
    {},
    { $set: { parcoursup_statut: "non pertinent", parcoursup_reference: false, parcoursup_error: null } }
  );
};

runScript(async () => {
  await run();
});
