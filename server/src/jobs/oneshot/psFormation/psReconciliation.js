const { getJsonFromXlsxFile } = require("../../../common/utils/fileUtils");
const logger = require("../../../common/logger");
const { partition, zip, size, chain } = require("lodash");

module.exports = async (catalogue, filePath) => {
  logger.info(`Traitement du fichier ${filePath} ...`);
  let data = getJsonFromXlsxFile(filePath);

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

  let result = match.map((item) => combinate(item));
  console.log("result", result); // husky wip
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
  if (size(array) === 1) {
    return array;
  }

  if (size(array) === 2) {
    return array;
  }

  let set = partition(array, (o) => o.type === "formateur");
  let [formateur, gestionnaire] = set;

  let result = [];

  if (size(formateur) > size(gestionnaire)) {
    result.push(distribute(formateur, gestionnaire));
  } else {
    result.push(distribute(gestionnaire, formateur));
  }

  return result;
}
