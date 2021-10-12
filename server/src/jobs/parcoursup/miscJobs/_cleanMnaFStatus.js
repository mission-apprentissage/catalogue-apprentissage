const { runScript } = require("../../scriptWrapper");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { PsFormation, ConvertedFormation } = require("../../../common/model");

runScript(async () => {
  await update();
});

async function update() {
  const dataset = await PsFormation.find({}).lean();

  await asyncForEach(dataset, async (psFormation) => {
    const { _id, matching_mna_formation, statut_reconciliation } = psFormation;

    if (statut_reconciliation === "AUTOMATIQUE") {
      const updateMna = [];
      const statutsPsMna = [];
      await asyncForEach(matching_mna_formation, async (mnaFormation) => {
        const mnaFormationU = await ConvertedFormation.findById(mnaFormation._id).lean();

        if (mnaFormationU && mnaFormationU.parcoursup_statut === "publié") {
          updateMna.push({
            _id: mnaFormationU._id,
            intitule_court: mnaFormationU.intitule_court,
            parcoursup_statut: "hors périmètre",
            id_rco_formation: mnaFormationU.id_rco_formation,
          });
          statutsPsMna.push("hors périmètre");
        } else {
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
    }
  });
}
