const { runScript } = require("../scriptWrapper");
const { asyncForEach } = require("../../common/utils/asyncUtils");
const { PsFormation, Formation } = require("../../common/model");

async function update() {
  const dataset = await PsFormation.find({}).lean();

  await asyncForEach(dataset, async (psFormation) => {
    const { _id, matching_mna_formation } = psFormation;

    const matchs = [];
    await asyncForEach(matching_mna_formation, async (mnaFormation) => {
      const mnaFormationU = await Formation.findById(mnaFormation._id).lean();
      if (mnaFormationU) {
        matchs.push({
          _id: mnaFormationU._id,
          intitule_court: mnaFormationU.intitule_court,
          parcoursup_statut: mnaFormationU.parcoursup_statut,
          cle_ministere_educatif: mnaFormationU.cle_ministere_educatif,
        });
      }
    });

    await PsFormation.findOneAndUpdate(
      { _id },
      {
        matching_mna_formation: matchs,
        matching_mna_etablissement: [],
        matching_mna_parcoursup_statuts: matchs?.map(({ parcoursup_statut }) => parcoursup_statut),
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
