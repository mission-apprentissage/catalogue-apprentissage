const { getJsonFromXlsxFile } = require("../../../common/utils/fileUtils");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { PsFormation, PsReconciliation } = require("../../../common/model");
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
    await asyncForEach(
      create,
      async ({ formation_id, uai_gestionnaire, etablissement_siret, matched_uai, code_cfd }) => {
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

        const etablissement = await catalogue.createEtablissement({
          uai: uai_gestionnaire,
          siret: etablissement_siret,
        });

        if (!etablissement) {
          logger.info(
            `Could not create etablissement — SIRET ${etablissement_siret} - ${uai_gestionnaire} - ${formation_id}`
          );
          return;
        }
        logger.info(`Etablissement ${etablissement._id} — ${etablissement.entreprise_raison_sociale} created`);

        const psformation = {
          id: etablissement._id,
          type,
        };

        await PsFormation.findByIdAndUpdate(formation_id, { $push: { mapping_liaison_etablissement: psformation } });
        logger.info(`Updated PsFormation ${formation_id} — etablissement ${psformation.id} - ${type}`);

        const mapping = await PsReconciliation.find({ id_psformation: formation_id });
        let psreconciliation = {};

        if (mapping.length > 0) {
          //update
          if (type === "formateur") {
            psreconciliation = {
              ...mapping,
              siret_formateur: etablissement.etablissement_siret,
            };
          } else {
            psreconciliation = {
              ...mapping,
              siret_gestionnaire: etablissement.etablissement_siret,
            };
          }
        } else {
          //create
          psreconciliation = {
            uai_gestionnaire,
            code_cfd,
            uai_affilie: uai_gestionnaire,
            uai_formateur: uai_gestionnaire,
            id_psformation: formation_id,
            siret_formateur: type === "formateur" ? etablissement.etablissement_siret : null,
            siret_gestionnaire: type === "gestionnaire" ? etablissement.etablissement_siret : null,
          };
        }

        await PsReconciliation.findOneAndUpdate({ id_psformation: formation_id }, psreconciliation, { upsert: true });
        logger.info(`Updated PsReconciliation ${formation_id} — etablissement ${psformation.id} - ${type}`);
      }
    );
  }

  logger.info(`Traitement terminé`);
};
