const axios = require("axios");
const { oleoduc, readLineByLine, transformData, writeData } = require("oleoduc");
const { mapper } = require("./mapper");
const { DualControlFormation } = require("../../../common/model/index");

// TODO remove limit => just for dev purpose
const RCO_NEW_STREAM_URL =
  "https://catalogue-recette.apprentissage.beta.gouv.fr/api/entity/formations.ndjson?limit=100";

const importer = async () => {
  await DualControlFormation.deleteMany({});

  // TODO here is it a stream or a paginated result ?
  const response = await axios({
    method: "get",
    url: RCO_NEW_STREAM_URL,
    responseType: "stream",
  });

  // read stream line by line to spare memory
  await oleoduc(
    response.data,
    readLineByLine(),
    transformData((line) => mapper(JSON.parse(line))),
    writeData(async (json) => await DualControlFormation.create(json))
  );
};

module.exports = { importer };
