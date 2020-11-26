const { MnaFormation } = require("../../../common/model/index");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const logger = require("../../../common/logger");

// const updateFormation = async (formation) => {
//   try {
//   } catch (error) {
//     throw new Error("Something went wrong");
//   }
// };

const run = async () => {
  const filter = {}; // TODO

  const formations = await MnaFormation.find({
    // parcoursup_reference: "NON",
    parcoursup_a_charger: false,
    ...filter,
  }).and([
    { educ_nat_code: { $ne: null } },
    { educ_nat_code: { $ne: "" } },
    { intitule_long: { $ne: null } },
    { intitule_long: { $ne: "" } },
    { intitule_court: { $ne: null } },
    { intitule_court: { $ne: "" } },
    { niveau: { $ne: null } },
    { niveau: { $ne: "" } },
  ]);

  const formationsToUpdate = formations.filter((item) => {
    if (
      item._doc.niveau === "4 (Bac...)" ||
      item._doc.niveau === "5 (BTS, DUT...)" ||
      item._doc.niveau === "6 (Licence...)"
    ) {
      if (
        item._doc.etablissement_formateur_uai !== null ||
        item._doc.etablissement_gestionnaire_uai !== null ||
        item._doc.uai_formation !== null
      ) {
        if (
          item._doc.etablissement_formateur_conventionne === "OUI" ||
          (item._doc.etablissement_reference_declare_prefecture === "OUI" &&
            item._doc.etablissement_reference_datadock === "datadocké")
        ) {
          // GROUPE 1  ON EST SUR QUE CES FORMATIONS ENTRENT
          return true;
        } else {
          if (
            item._doc.rncp_eligible_apprentissage &&
            (item._doc.rncp_etablissement_formateur_habilite || item._doc.rncp_etablissement_gestionnaire_habilite)
          ) {
            // CHECK RNCP
            return true;
          }
        }
      }
    }

    return false;
  });
  logger.info(`${formationsToUpdate.length} Formations to update`);

  await asyncForEach(formationsToUpdate, async (item) => {
    let updatedTraining = {
      ...item._doc,
    };
    updatedTraining.parcoursup_a_charger = true;
    updatedTraining.last_update_at = Date.now();
    await MnaFormation.findOneAndUpdate({ _id: item._id }, updatedTraining, { new: true });
    logger.info(`Formation ${item._id} has been updated`);
  });
};

module.exports = { run };
