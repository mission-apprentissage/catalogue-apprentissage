const { runScript } = require("../scriptWrapper");
const { Etablissement, Formation } = require("../../common/models");
const { validateUAI } = require("../../common/utils/uaiUtils");

const updateUaiValidity = async (collection, uaiField, uaiValidityField) => {
  console.info(`Checking for UAI in collection...`);
  const cursor = await collection.find().cursor();
  let count = 0;

  for await (const entry of cursor) {
    const valid = !entry[uaiField] || (await validateUAI(entry[uaiField]));
    !valid && console.log(`❌ ${entry[uaiField]}`);
    !valid && count++;

    await collection.updateOne(
      { _id: entry._id },
      {
        $set: {
          [uaiValidityField]: valid,
        },
      }
    );
  }
  console.info(`${count} UAI not valid !`);
  console.info(`Checking for UAI in collection: 🆗`);
  console.info(`----------------------------------`);
};

const checkUai = async () => {
  try {
    await updateUaiValidity(Etablissement, "uai", "uai_valide");
    await updateUaiValidity(Formation, "uai_formation", "uai_formation_valide");
  } catch (error) {
    console.error(error);
  }
};

module.exports = checkUai;

if (process.env.standalone) {
  runScript(async () => await checkUai());
}
