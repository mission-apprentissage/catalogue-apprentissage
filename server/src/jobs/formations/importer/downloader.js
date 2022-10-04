const path = require("path");
const fs = require("fs");
const axios = require("axios");
// const https = require("https");
const { parser: streamParser } = require("stream-json");
const { streamArray } = require("stream-json/streamers/StreamArray");
const StreamZip = require("node-stream-zip");
const { oleoduc, writeData, transformData } = require("oleoduc");
const { DualControlFormation } = require("../../../common/model/index");
const { parser } = require("./parser");

const RCO_ZIP_URL = "https://mnadownloader-preprod.intercariforef.org/";
const RCO_ZIP_PATH = "./assets/rco.zip";

const downloadZip = async () => {
  // FIXME : Remove when ssl certificate for intercariforef.org is renewed
  // const agent = new https.Agent({
  //   rejectUnauthorized: false,
  // });

  const response = await axios({
    method: "get",
    url: RCO_ZIP_URL,
    responseType: "stream",
    // httpsAgent: agent,
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

const extractFromZip = async () => {
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
      transformData(({ value: line }) => parser(line)),
      writeData(async (json) => await DualControlFormation.create(json))
    );
  } else {
    console.error("One and only one file required inside zip");
  }

  await zip.close();
};

const downloader = async () => {
  let error = null;
  try {
    await downloadZip();
    await DualControlFormation.deleteMany({});
    await extractFromZip();
  } catch (e) {
    error = e;
    console.error(e);
  }

  return error;
};

module.exports = { downloader };
