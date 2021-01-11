const { getJsonFromXlsxFile } = require("../../../common/utils/fileUtils");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { PsFormation, PsReconciliation } = require("../../../common/model");
const logger = require("../../../common/logger");
const mongoose = require("mongoose");

module.exports = async (filePath) => {
  logger.info(`Traitement du fichier ${filePath} ...`);
  let data = getJsonFromXlsxFile(filePath);

  const remove = data.filter((x) => x.Analyse === "DELETE");
  const match = data.filter((x) => x.Analyse === "TRUE" && x.etablissement_id);
  const verify = data.filter((x) => x.Analyse === "STANDBY");

  const formatMatch = Object.values(
    match.reduce((acc, item) => {
      if (!acc[item.formation_id]) {
        acc[item.formation_id] = [];
      }

      if (acc[item.formation_id] === item.formation_id) {
        acc[item.formation_id].push({
          type: item.matched_uai === "UAI_FORMATEUR" ? "formateur" : "gestionnaire",
          ...item,
        });
      } else {
        acc[item.formation_id].push({
          type: item.matched_uai === "UAI_FORMATEUR" ? "formateur" : "gestionnaire",
          ...item,
        });
      }
      return acc;
    }, [])
  );

  logger.info(
    `Traitement à effectuer : 
      formation: ${data.filter((x) => x.formation_id).length},
      delete: ${remove.length},
      verify: ${verify.length},
      match: ${match.length},
      formatted: ${formatMatch.length}
    `
  );

  if (match.length > 0) {
    await asyncForEach(match, async ({ formation_id, matched_uai, etablissement_id }) => {
      let type;

      switch (matched_uai) {
        case "UAI_FORMATEUR":
          type = "formateur";
          break;
        case "UAI_RESPONSABLE":
          type = "gestionnaire";
          break;
        default:
          break;
      }

      const psformation = {
        type: type,
        id: etablissement_id,
      };

      await PsFormation.findByIdAndUpdate(formation_id, { $push: { mapping_liaison_etablissement: psformation } });
      logger.info(`Update PsFormation ${formation_id} — etablissement ${psformation.id}`);
    });

    await asyncForEach(formatMatch, async (formation) => {
      const payload = formation.reduce((acc, item) => {
        acc.uai_gestionnaire = item.uai_gestionnaire;
        acc.uai_affilie = item.uai_gestionnaire;
        acc.uai_composante = item.uai_gestionnaire;
        acc.id_psformation = item.formation_id;
        acc.code_cfd = item.code_cfd;
        acc.siret_formateur = item.type === "formateur" ? item.etablissement_siret : acc.siret_formateur;
        acc.siret_gestionnaire = item.type === "gestionnaire" ? item.etablissement_siret : acc.siret_gestionnaire;
        return acc;
      }, {});

      await PsReconciliation.findOneAndUpdate({ id_psformation: payload.id_psformation }, payload, { upsert: true });
      logger.info(`Update PsReconciliation ${payload.id_psformation}`);
    });
  }

  if (verify.length > 0) {
    await asyncForEach(verify, async ({ formation_id, etablissement_id }) => {
      await PsFormation.updateOne(
        { _id: formation_id },
        { $set: { "matching_mna_etablissement.$[elem].mapping_etat_reconciliation": "A VERIFIER" } },
        { arrayFilters: [{ "elem._id": new mongoose.Types.ObjectId(etablissement_id) }] }
      );
      logger.info(`Set to verify ${formation_id}`);
    });
  }

  if (remove.length > 0) {
    await asyncForEach(remove, async ({ formation_id, etablissement_id }) => {
      await PsFormation.updateOne(
        {
          _id: formation_id,
        },
        { $pull: { matching_mna_etablissement: { _id: new mongoose.Types.ObjectId(etablissement_id) } } }
      );
      logger.info(`Removed establishment from matched list : ${etablissement_id} - formation : ${formation_id}`);
    });
  }

  logger.info(`Traitement terminé`);
};
