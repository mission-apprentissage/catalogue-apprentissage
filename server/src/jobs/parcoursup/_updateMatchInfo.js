const { runScript } = require("../scriptWrapper");
const { asyncForEach } = require("../../common/utils/asyncUtils");
const { PsFormation, Formation } = require("../../common/model");

async function update() {
  const dataset = await PsFormation.find({}).lean();

  await asyncForEach(dataset, async (psFormation) => {
    const { _id, matching_mna_formation } = psFormation;

    const updateMna = [];
    const statutsPsMna = [];
    await asyncForEach(matching_mna_formation, async (mnaFormation) => {
      const mnaFormationU = await Formation.findById(mnaFormation._id).lean();
      if (mnaFormationU) {
        updateMna.push({
          _id: mnaFormationU._id,
          intitule_court: mnaFormationU.intitule_court,
          parcoursup_statut: mnaFormationU.parcoursup_statut,
          id_rco_formation: mnaFormationU.id_rco_formation,
        });
        statutsPsMna.push(mnaFormationU.parcoursup_statut);
      }
    });

    await PsFormation.findOneAndUpdate(
      { _id },
      {
        matching_mna_formation: updateMna,
        matching_mna_etablissement: [],
        matching_mna_parcoursup_statuts: statutsPsMna,
      }
    );
  });
}

module.exports = update;

if (process.env.standalone) {
  runScript(async () => {
    await update();
  });
}
