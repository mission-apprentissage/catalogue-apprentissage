const { ConvertedFormation } = require("../../../common/model");
const { runScript } = require("../../scriptWrapper");

const run = async () => {
  try {
    const resultsFormateur = (await ConvertedFormation.find({}, { etablissement_formateur_siret: 1 })).map((item) => {
      return item.etablissement_formateur_siret;
    });
    const resultsGestionnaire = (await ConvertedFormation.find({}, { etablissement_gestionnaire_siret: 1 })).map(
      (item) => {
        return item.etablissement_gestionnaire_siret;
      }
    );

    const filter = resultsFormateur.filter((item) => {
      return !resultsGestionnaire.includes(item);
    });

    console.log([...new Set(filter)]);
  } catch (err) {
    console.log(err);
  }
};

runScript(async () => {
  await run();
});
