// const axios = require("axios");
// const { oleoduc, readLineByLine, transformData, writeData } = require("oleoduc");
const { mapper } = require("./mapper");
const { parser } = require("./parser");

const { DualControlFormation } = require("../../../common/model/index");
const { asyncForEach } = require("../../../common/utils/asyncUtils");

const jsonData = require("./assets/_catalogue_mna_2022__20220329");

// // TODO remove limit => just for dev purpose
// const RCO_NEW_STREAM_URL =
//   "https://catalogue-recette.apprentissage.beta.gouv.fr/api/entity/formations.ndjson?limit=100";

const importer = async () => {
  await DualControlFormation.deleteMany({});

  // // TODO here is it a stream or a paginated result ?
  // const response = await axios({
  //   method: "get",
  //   url: RCO_NEW_STREAM_URL,
  //   responseType: "stream",
  // });

  // // read stream line by line to spare memory
  // await oleoduc(
  //   response.data,
  //   readLineByLine(),
  //   transformData((line) => parser(mapper(JSON.parse(line)))),
  //   writeData(async (json) => await DualControlFormation.create(json))
  // );

  // TODO remove : first file is in assets since RCO has not configured FTP yet
  await asyncForEach(jsonData["__catalogue_mna_2022"] /*.slice(0, 100)*/, async (line, index) => {
    if (index % 1000 === 0) {
      console.log(`Importing data ${index}`);
    }
    const mappedData = mapper(line);
    const parsedData = parser(mappedData);
    await DualControlFormation.create(parsedData);
  });
};

module.exports = { importer };
