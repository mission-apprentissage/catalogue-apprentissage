const { getJsonFromXlsxFile } = require("../../../common/utils/fileUtils");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { PsFormation } = require("../../../common/model");
const logger = require("../../../common/logger");
const mongoose = require("mongoose");

module.exports = async (catalogue, filePath) => {
  logger.info(`Traitement du fichier ${filePath} ...`);
  let data = getJsonFromXlsxFile(filePath);

  const create = data.filter((x) => x.Analyse === "CREATE");
  const remove = data.filter((x) => x.Analyse === "DELETE");
  const match = data.filter((x) => x.Analyse === "TRUE" && x.etablissement_id);
  const verify = data.filter((x) => x.Analyse === "STANDBY");

  logger.info(
    `Traitement à effectuer : 
      formation: ${data.filter((x) => x.formation_id).length},
      create: ${create.length},
      delete: ${remove.length},
      verify: ${verify.length},
      match: ${match.length}
    `
  );

  if (match.length > 0) {
    Promise.all(
      match.map(async ({ formation_id, matched_uai, etablissement_id }) => {
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

        const payload = {
          type: type,
          id: etablissement_id,
        };
        logger.info(`Update formation ${formation_id} — etablissement ${payload.id}`);
        await PsFormation.findByIdAndUpdate(formation_id, { $push: { mapping_liaison_etablissement: payload } });
      })
    );
  }

  if (verify.length > 0) {
    Promise.all(
      verify.map(async ({ formation_id, etablissement_id }) => {
        logger.info(`Set to verify ${formation_id}`);

        await PsFormation.updateOne(
          { _id: formation_id },
          { $set: { "matching_mna_etablissement.$[elem].mapping_etat_reconciliation": "A VERIFIER" } },
          { arrayFilters: [{ "elem._id": new mongoose.Types.ObjectId(etablissement_id) }] }
        );
      })
    );
  }

  if (remove.length > 0) {
    Promise.all(
      remove.map(async ({ formation_id, etablissement_id }) => {
        logger.info(`Remove establishment from matched list : ${etablissement_id} - formation : ${formation_id}`);

        await PsFormation.updateOne(
          {
            _id: formation_id,
          },
          { $pull: { matching_mna_etablissement: { _id: new mongoose.Types.ObjectId(etablissement_id) } } }
        );
      })
    );
  }

  if (create.length > 0) {
    await asyncForEach(create, async ({ formation_id, uai_gestionnaire, etablissement_siret, matched_uai }) => {
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

      const payload = {
        uai: uai_gestionnaire,
        siret: etablissement_siret,
      };

      const etablissement = await catalogue.createEtablissement(payload);
      logger.info(`Etablissement ${etablissement._id} — ${etablissement.entreprise_raison_sociale} created`);

      const match = {
        id: etablissement._id,
        type: type,
      };

      logger.info(`Update formation ${formation_id} — etablissement ${match.id} - ${type}`);
      await PsFormation.findByIdAndUpdate(formation_id, { mapping_liaison_etablissement: match });
    });
  }

  logger.info(`Traitement terminé`);
};
