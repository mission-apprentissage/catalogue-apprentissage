const fs = require("fs-extra");
const axios = require("axios");
const logger = require("../../common/logger");
const XLSX = require("xlsx");

const readXLSXFile = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath, { codepage: 65001 });

    return { sheet_name_list: workbook.SheetNames, workbook };
  } catch (error) {
    return null;
  }
};

const getJsonFromXlsxFile = (filePath) => {
  try {
    const { sheet_name_list, workbook } = readXLSXFile(filePath);
    const worksheet = workbook.Sheets[sheet_name_list[0]];
    const json = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    return json;
  } catch (err) {
    return null;
  }
};

const createXlsxFromJson = (data, filePath, tabName = "tab") => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data), tabName);

  XLSX.writeFileAsync(filePath, workbook, { compression: true }, (e) => {
    if (e) {
      // console.log(e);
      throw new Error("La génération du fichier excel à échoué : ", e);
    }
  });
};

const downloadFile = async (url, to) => {
  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    const writer = fs.createWriteStream(to);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (e) {
    logger.error({ type: "utils" }, `unable to download file ${url}`);
    return null;
  }
};

module.exports = { createXlsxFromJson, getJsonFromXlsxFile, downloadFile };
