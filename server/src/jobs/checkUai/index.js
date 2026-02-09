const { runScript } = require("../scriptWrapper");
const { Etablissement, Formation } = require("../../common/models");
const { validateUAI } = require("../../common/utils/uaiUtils");
const logger = require("../../common/logger");

const updateUaiValidity = async (model, uaiField, uaiValidityField) => {
  logger.info({ type: "job" }, `Vérification de la validité des UAIs dans la collection ${model.collection.name} ⏳`);

  try {
    let count = 0;

    for await (const entry of model.find()) {
      const valid = !entry[uaiField] || (await validateUAI(entry[uaiField]));
      !valid && logger.info({ type: "job" }, `❌ ${entry[uaiField]}`);
      !valid && count++;

      await model.updateOne(
        { _id: entry._id },
        {
          $set: {
            [uaiValidityField]: valid,
          },
        }
      );
    }
    logger.info({ type: "job" }, `${count} UAI non valide(s) !`);
    logger.info(
      { type: "job" },
      `Vérification de la validité des UAIs dans la collection ${model.collection.name}: ✅`
    );
  } catch (error) {
    logger.error({ type: "job" }, error);
    logger.error(
      { type: "job" },
      `Vérification de la validité des UAIs dans la collection ${model.collection.name}: ❌`
    );
  }
};

const checkUai = async () => {
  await updateUaiValidity(Etablissement, "uai", "uai_valide");
  await updateUaiValidity(Formation, "uai_formation", "uai_formation_valide");
};

module.exports = checkUai;

if (process.env.standalone) {
  runScript(async () => await checkUai());
}
