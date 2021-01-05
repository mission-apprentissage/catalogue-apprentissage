const { getJsonFromXlsxFile } = require("../../../common/utils/fileUtils");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { PsFormation } = require("../../../common/model");
const logger = require("../../../common/logger");

module.exports = async (catalogue, filePath) => {
  logger.info(`Traitement du fichier ${filePath} ...`);
  let data = getJsonFromXlsxFile(filePath);

  const create = data.filter((x) => x.Analyse === "CREATE");

  logger.info(
    `Traitement à effectuer : 
      formation: ${data.filter((x) => x.formation_id).length},
      create: ${create.length},
    `
  );

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

      logger.info(`Formation : ${formation_id} - SIRET : ${etablissement_siret} - ${type}`);

      const formation = await PsFormation.findById(formation_id);
      const exist = formation?.mapping_liaison_etablissement?.find((x) => x.type === type);

      if (exist) {
        logger.info("Already mapped, skipping formation");
        return;
      }

      const reference = {
        uai: uai_gestionnaire,
        siret: etablissement_siret,
      };

      const etablissement = await catalogue.createEtablissement(reference);
      logger.info(`Etablissement ${etablissement._id} — ${etablissement.entreprise_raison_sociale} created`);

      const payload = {
        id: etablissement._id,
        type,
      };

      logger.info(`Update formation ${formation_id} — etablissement ${payload.id} - ${type}`);
      await PsFormation.findByIdAndUpdate(formation_id, { $push: { mapping_liaison_etablissement: payload } });
    });
  }

  logger.info(`Traitement terminé`);
};
