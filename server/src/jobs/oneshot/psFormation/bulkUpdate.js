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
    libelle_uai_affilie: { $regex: ".*agricole*." },
    matching_type: { $ne: "6" },
  }).lean();

  console.log("A TRAITER", data.length);

  const agricole = RegExp("agricole|agriculture", "g");
  const formateur = RegExp("CFAA|CFA AGRICOLE", "g");
  const gestionnaire = RegExp(
    "LEGTA|ETABLISSEMENT PUBLIC LOCAL D'ENSEIGNEMENT ET DE FORMATION PROFESSIONNELLE AGRICOLE",
    "g"
  );

  await asyncForEach(
    data,
    async ({ _id, libelle_uai_composante, libelle_uai_affilie, matching_mna_etablissement, ...rest }) => {
      if (agricole.test(libelle_uai_composante) || agricole.test(libelle_uai_affilie)) {
        let etablissement = [];

        await asyncForEach(matching_mna_etablissement, async (etab) => {
          if (gestionnaire.test(etab.raison_social) || formateur.test(etab.enseigne)) {
            console.log("gestionnaire", rest._id, rest.id_mna_etablissement);
            etablissement.push({ ...etab, type: "gestionnaire" });
          }
          if (formateur.test(etab.raison_social) || formateur.test(etab.enseigne)) {
            console.log("formateur", rest._id, rest.id_mna_etablissement);
            etablissement.push({ ...etab, type: "formateur" });
          }
        });

        if (etablissement.length === 0) return;

        let unique = uniqBy(etablissement, (x) => x.etablissement_id);

        // replace matching with new filtered establishment
        await PsFormation.findByIdAndUpdate(_id, { matching_mna_etablissement: unique });

        // update mapping_liaison_etablissement for each unique etablissement
        // following Anne approval on slack (16/12/2020 20h14), if an establishment is both, add both
        Promise.all(
          unique.map(async (item) => {
            await PsFormation.findByIdAndUpdate(_id, {
              mapping_liaison_etablissement: { id: item.id_mna_etablissement, type: item.type },
            });
          })
        );
      }
    }
  );
};
