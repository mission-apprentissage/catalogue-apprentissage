const { ConvertedFormation } = require("../../../common/model/index");
const { runScript } = require("../../scriptWrapper");

const run = async () => {
  await ConvertedFormation.updateMany(
    {},
    {
      $set: {
        affelnet_statut: "hors périmètre",
        affelnet_reference: false,
        affelnet_error: null,
        parcoursup_statut: "hors périmètre",
        parcoursup_reference: false,
        parcoursup_error: null,
      },
    }
  );
};

runScript(async () => {
  await run();
});
