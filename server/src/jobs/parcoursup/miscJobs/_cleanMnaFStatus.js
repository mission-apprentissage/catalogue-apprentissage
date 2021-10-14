const { runScript } = require("../../scriptWrapper");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { PsFormation, ConvertedFormation } = require("../../../common/model");

runScript(async () => {
  await update();
});

async function update() {
  const dataset = await PsFormation.find({}, { _id: 1, matching_mna_formation: 1, statut_reconciliation: 1 }).lean();

  await asyncForEach(dataset, async ({ _id, matching_mna_formation, statut_reconciliation }) => {
    if (statut_reconciliation !== "VALIDE") {
      const updateMna = [];
      const statutsPsMna = [];
      await asyncForEach(matching_mna_formation, async (mnaFormation) => {
        const mnaFormationU = await ConvertedFormation.findById(mnaFormation._id);

        if (mnaFormationU && mnaFormationU.parcoursup_statut === "publié") {
          updateMna.push({
            _id: mnaFormationU._id,
            intitule_court: mnaFormationU.intitule_court,
            parcoursup_statut: "hors périmètre",
            id_rco_formation: mnaFormationU.id_rco_formation,
          });
          statutsPsMna.push("hors périmètre");

          mnaFormationU.parcoursup_statut = "hors périmètre";
          mnaFormationU.save();
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
  await ConvertedFormation.updateMany(
    { parcoursup_statut: "publié", published: true },
    { $set: { parcoursup_statut: "hors périmètre", parcoursup_reference: false } }
  );
}
