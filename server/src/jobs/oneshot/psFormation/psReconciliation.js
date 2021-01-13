const { getJsonFromXlsxFile } = require("../../../common/utils/fileUtils");
const logger = require("../../../common/logger");
const { partition, zip, size, chain } = require("lodash");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { PsReconciliation } = require("../../../common/model");

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
    if (item.Analyse === "CREATE") {
      await catalogue.createEtablissement({ uai: item.uai_gestionnaire, siret: item.etablissement_siret });
      logger.info(`Etablissement uai : ${item.uai_gestionnaire} - siret : ${item.etablissement_siret} créé`);
    }
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

    try {
      await PsReconciliation.save(payload);
      logger.info(`Formation ${payload.code_cfd} réconcilié`);
    } catch (error) {
      logger.error(error);
    }
  });
};

/**
 * Distribute arr1 with each arr2 element.
 * arr1 must be taller
 */
function distribute(arr1, arr2) {
  let ratio = Math.ceil(size(arr1) / size(arr2));
  let pattern = chain(new Array(ratio)).fill(arr2).flatten().take(size(arr1)).value();

  return zip(arr1, pattern);
}

function combinate(array) {
  if (size(array) <= 2) {
    return array;
  }

  let result = [];
  let [formateur, gestionnaire] = partition(array, (x) => x.type === "formateur");

  if (size(formateur) > size(gestionnaire)) {
    result.push(distribute(formateur, gestionnaire));
  } else {
    result.push(distribute(gestionnaire, formateur));
  }

  return result;
}
