const path = require("path");
const fs = require("fs");
const axios = require("axios");
const { parser: streamParser } = require("stream-json");
const { streamArray } = require("stream-json/streamers/StreamArray");
const StreamZip = require("node-stream-zip");
const { oleoduc, transformData, writeData } = require("oleoduc");
const { DualControlFormation } = require("../../../common/model/index");
const { mapper } = require("./mapper");
const { parser } = require("./parser");

const RCO_ZIP_URL = "https://mnadownloader.intercariforef.org/";
const RCO_ZIP_PATH = "./assets/rco.zip";

const downloadZip = async () => {
  const response = await axios({
    method: "get",
    url: RCO_ZIP_URL,
    responseType: "stream",
  });

  const file = fs.createWriteStream(path.join(__dirname, RCO_ZIP_PATH));
  return new Promise((resolve, reject) => {
    response.data.pipe(file);
    file.on("finish", () => {
      file.close(() => resolve());
    });
    file.on("error", (err) => reject(err));
  });
};

const importFromZip = async () => {
  const zip = new StreamZip.async({ file: path.join(__dirname, RCO_ZIP_PATH) });
  const entriesCount = await zip.entriesCount;

  if (entriesCount === 1) {
    const entries = await zip.entries();
    const entry = Object.values(entries)[0];
    console.log(`Fichier dans l'archive: ${entry.name} (${(entry.size / (1000 * 1000)).toFixed(2)} Mo)`);

    const stream = await zip.stream(entry.name);

    await oleoduc(
      stream,
      streamParser(),
      streamArray(),
      transformData(({ value: line }) => parser(mapper(line))),
      writeData(async (json) => await DualControlFormation.create(json))
    );
  } else {
    console.error("One and only one file required inside zip");
  }

  await zip.close();
};

const importer = async () => {
  let error = null;
  try {
    await downloadZip();
    await DualControlFormation.deleteMany({});
    await importFromZip();
  } catch (e) {
    error = e;
    console.error(e);
  }

  return error;
};

module.exports = { importer };
