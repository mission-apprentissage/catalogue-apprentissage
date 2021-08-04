const { runScript } = require("../../scriptWrapper");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { PsFormation2021, ConvertedFormation } = require("../../../common/model");

runScript(async () => {
  await update();
});

async function update() {
  const dataset = await PsFormation2021.find({}).lean();

  await asyncForEach(dataset, async (psFormation2021) => {
    const { _id, matching_mna_formation } = psFormation2021;

    const updateMna = [];
    const statutsPsMna = [];
    await asyncForEach(matching_mna_formation, async (mnaFormation) => {
      const mnaFormationU = await ConvertedFormation.findById(mnaFormation._id).lean();
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

    await PsFormation2021.findOneAndUpdate(
      { _id },
      {
        matching_mna_formation: updateMna,
        matching_mna_etablissement: [],
        matching_mna_parcoursup_statuts: statutsPsMna,
      }
    );
  });
}
