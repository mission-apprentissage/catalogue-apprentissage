const { AfFormation } = require("../../../common/model");
const { runScript } = require("../../scriptWrapper");
const logger = require("../../../common/logger");
const XLSX = require("xlsx");
const path = require("path");

runScript(async () => {
  logger.info(`Start affelnet export`);

  const formations = await AfFormation.find({ code_cfd: { $eq: null } }).lean();
  console.log("formations.length", formations.length);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formations), "affelnet");

  XLSX.writeFileAsync(path.join(__dirname, `/assets/export.xlsx`), workbook, (e) => {
    if (e) {
      console.log(e);
      throw new Error("La génération du fichier excel à échoué : ", e);
    }
  });

  logger.info(`End affelnet export`);
});

module.exports = () => {};
