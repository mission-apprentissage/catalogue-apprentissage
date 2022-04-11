const path = require("path");
const { parser: streamParser } = require("stream-json");
const { streamArray } = require("stream-json/streamers/StreamArray");
const StreamZip = require("node-stream-zip");
const { oleoduc, transformData, writeData } = require("oleoduc");
const { mapper } = require("./mapper");
const { parser } = require("./parser");
const { DualControlFormation } = require("../../../common/model/index");

// TODO download remote file once it exists and is not empty
const importFromZip = async () => {
  const zip = new StreamZip.async({ file: path.join(__dirname, "./assets/_catalogue_mna_2022__20220406.zip") });
  const entriesCount = await zip.entriesCount;

  if (entriesCount === 1) {
    const entries = await zip.entries();
    const entry = Object.values(entries)[0];
    console.log(`Entry ${entry.name}: ${entry.size} bytes`);

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
  await DualControlFormation.deleteMany({});
  await importFromZip();
};

module.exports = { importer };
