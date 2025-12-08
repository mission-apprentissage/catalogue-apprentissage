const { BcnFormationDiplome, BcnNNiveauFormationDiplome } = require("../../common/models");
const { mappingCodesEnNiveau } = require("../controller/bcn/Constants");

async function getNiveauxDiplomesTree() {
  return Object.entries(mappingCodesEnNiveau).reduce(async (acc, [niveau, value]) => {
    const accSync = await acc;
    const regex = new RegExp(`^(${value.join("|")})`);

    // @ts-ignore
    const niveauxFormationDiplome = await BcnFormationDiplome.distinct("NIVEAU_FORMATION_DIPLOME", {
      FORMATION_DIPLOME: { $regex: regex },
    });

    // @ts-ignore
    accSync[niveau] = await BcnNNiveauFormationDiplome.distinct("LIBELLE_100", {
      NIVEAU_FORMATION_DIPLOME: { $in: niveauxFormationDiplome },
    });

    return accSync;
  }, {});
}

module.exports = {
  getNiveauxDiplomesTree,
};
