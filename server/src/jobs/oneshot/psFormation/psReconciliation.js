const combinate = require("../../../logic/mappers/psReconciliationMapper");
const { getJsonFromXlsxFile } = require("../../../common/utils/fileUtils");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { PsReconciliation } = require("../../../common/model");
const logger = require("../../../common/logger");

module.exports = async (catalogue, filePath) => {
  logger.info(`Traitement du fichier ${filePath} ...`);
  let data = getJsonFromXlsxFile(filePath);

  // format dataset per formation_id
  const match = Object.values(
    data
      .filter((x) => x.Analyse === "CREATE" || x.Analyse === "TRUE")
      .reduce((acc, item) => {
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

  // generate all possible combination between formateur and gestionnaire
  let result = match.map((item) => combinate(item));

  // create establishments
  await asyncForEach(result, async (item) => {
    await asyncForEach(item, async ({ Analyse, uai_gestionnaire, etablissement_siret }) => {
      if (Analyse === "CREATE") {
        await catalogue.createEtablissement({ uai: uai_gestionnaire, siret: etablissement_siret });
        logger.info(`Etablissement uai : ${uai_gestionnaire} - siret : ${etablissement_siret} créé`);
      }
    });
  });

  // save in db
  await asyncForEach(result, async (couple) => {
    const payload = couple.reduce((acc, item) => {
      acc.uai_gestionnaire = item.uai_gestionnaire;
      acc.uai_affilie = item.uai_gestionnaire;
      acc.uai_composante = item.uai_gestionnaire;
      acc.code_cfd = item.code_cfd;
      acc.siret_formateur = item.type === "formateur" ? item.etablissement_siret : acc.siret_formateur;
      acc.siret_gestionnaire = item.type === "gestionnaire" ? item.etablissement_siret : acc.siret_gestionnaire;

      return acc;
    }, {});

    let { code_cfd, uai_affilie, uai_composante, uai_gestionnaire, siret_formateur, siret_gestionnaire } = payload;

    // Avoid duplicate (flat files might have the same record)
    let exist = await PsReconciliation.findOne({
      code_cfd,
      uai_affilie,
      uai_composante,
      uai_gestionnaire,
      siret_formateur,
      siret_gestionnaire,
    });

    if (exist) return;

    try {
      await PsReconciliation.create(payload);
      logger.info(`Formation ${payload.code_cfd} réconcilié`);
    } catch (error) {
      logger.error(error);
    }
  });
};
