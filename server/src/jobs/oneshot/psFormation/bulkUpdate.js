/**
  * TARGET :
  * SI le libellé_uai_composante OU libelle_uai_affilié contient "agricole" ou "agriculture" 
  * ET qu'un établissement matché CONTIENT "CFAA" ou "CFA AGRICULTURE", 
  * ALORS c'est le formateur de cette formation.
  * 
    SI le libellé_uai_composante OU libelle_uai_affilié contient "agricole" ou "agriculture" 
    ET qu'un établissement matché CONTIENT "LEGTA" ou "ETABLISSEMENT PUBLIC LOCAL D'ENSEIGNEMENT ET DE FORMATION PROFESSIONNELLE AGRICOLE", 
    ALORS c'est le gestionnaire de cette formation.
  */

const { asyncForEach } = require("../../../common/utils/asyncUtils");
const uniqBy = require("lodash/uniqBy");

const { PsFormation } = require("../../../common/model");

module.exports = async () => {
  const data = await PsFormation.find({
    $and: [
      { libelle_uai_composante: { $regex: "agricole|agriculture" } },
      { libelle_uai_affilie: { $regex: "agricole|agriculture" } },
    ],
    matching_type: { $ne: "6" },
  }).lean();

  console.log("A TRAITER", data.length);

  const formateur = RegExp("CFAA|CFA AGRICOLE", "g");
  const gestionnaire = RegExp(
    "LEGTA|ETABLISSEMENT PUBLIC LOCAL D'ENSEIGNEMENT ET DE FORMATION PROFESSIONNELLE AGRICOLE",
    "g"
  );

  await asyncForEach(data, async (formation) => {
    let etablissement = [];

    await asyncForEach(formation.matching_mna_etablissement, async (etab) => {
      if (gestionnaire.test(etab.raison_social) || formateur.test(etab.enseigne)) {
        console.log("gestionnaire", formation._id, etab.id_mna_etablissement);
        etablissement.push({ ...etab, type: "gestionnaire" });
      }
      if (formateur.test(etab.raison_social) || formateur.test(etab.enseigne)) {
        console.log("formateur", formation._id, etab.id_mna_etablissement);
        etablissement.push({ ...etab, type: "formateur" });
      }
    });

    if (etablissement.length === 0) return;

    let unique = uniqBy(etablissement, (x) => x.id_mna_etablissement);

    // replace matching with new filtered establishment
    await PsFormation.findByIdAndUpdate(formation._id, { matching_mna_etablissement: unique });

    // update mapping_liaison_etablissement for each unique etablissement
    // following Anne approval on slack (16/12/2020 20h14), if an establishment is both, add both
    Promise.all(
      unique.map(async (item) => {
        await PsFormation.findByIdAndUpdate(formation._id, {
          mapping_liaison_etablissement: { id: item.id_mna_etablissement, type: item.type },
        });
      })
    );
  });
};
