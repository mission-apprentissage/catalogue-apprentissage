const csvToJson = require("convert-csv-to-json-latin");

const FILE_PATH = "/data/uploads/mefs-parcoursup.csv";
let mefsAllowedOnParcoursup = null;

const loadMefsAllowedOnParcoursup = (jsonData = null) => {
  const lines = jsonData ?? csvToJson.getJsonFromCsv(FILE_PATH);
  mefsAllowedOnParcoursup = lines.map(({ MEF }) => MEF.trim());
};

const findMefsForParcoursup = ({ bcn_mefs_10 }) => {
  if (!mefsAllowedOnParcoursup) {
    loadMefsAllowedOnParcoursup();
  }
  return bcn_mefs_10.filter(({ mef10 }) => mefsAllowedOnParcoursup.includes(mef10));
};

module.exports = {
  findMefsForParcoursup,
  loadMefsAllowedOnParcoursup,
};
