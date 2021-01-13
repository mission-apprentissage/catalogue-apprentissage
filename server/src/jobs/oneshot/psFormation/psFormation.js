const { getJsonFromXlsxFile } = require("../../../common/utils/fileUtils");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { PsFormation } = require("../../../common/model");
const logger = require("../../../common/logger");
const mongoose = require("mongoose");

module.exports = async (filePath) => {
  logger.info(`Traitement du fichier ${filePath} ...`);
  let data = getJsonFromXlsxFile(filePath);

  const remove = data.filter((x) => x.Analyse === "DELETE");
  const verify = data.filter((x) => x.Analyse === "STANDBY");

  logger.info(
    `Traitement à effectuer : 
      formation: ${data.filter((x) => x.formation_id).length},
      delete: ${remove.length},
      verify: ${verify.length},
    `
  );

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
