const { oleoduc, readLineByLine, transformData, writeData } = require("oleoduc");
const { mapper } = require("./mapper");
const { parser } = require("./parser");
const { DualControlFormation } = require("../../../common/model/index");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
let Client = require("ssh2-sftp-client");
const fs = require("fs");
const config = require("config");

const jsonData = require("./assets/_catalogue_mna_2022__20220406");

// // TODO remove limit => just for dev purpose
// const RCO_NEW_STREAM_URL =
//   "https://catalogue-recette.apprentissage.beta.gouv.fr/api/entity/formations.ndjson?limit=100";

let client = new Client();

const importFromFtp = async () => {
  try {
    await client.connect({
      host: config.rco.ftp.host,
      port: config.rco.ftp.port,
      username: config.rco.ftp.user,
      // password: config.rco.ftp.password,
      privateKey: fs.readFileSync(config.rco.ftp.privateKey),
      passphrase: config.rco.ftp.passphrase,
    });

    const list = await client.list(config.rco.ftp.dir);
    const file = list[0];

    console.log("file found on ftp: ", file.name);

    const stream = client.sftp.createReadStream(`${config.rco.ftp.dir}/${file.name}`);

    // read stream line by line to spare memory
    await oleoduc(
      stream,
      readLineByLine(),
      transformData((line) => parser(mapper(JSON.parse(line)))),
      writeData(async (json) => await DualControlFormation.create(json))
    );

    await client.end();
  } catch (err) {
    console.log(err);
  }
};

// TODO remove : first file is in assets since RCO has not configured FTP yet
const importFromLocalFile = async () => {
  await asyncForEach(jsonData /*.slice(0, 100)*/, async (line, index) => {
    if (index % 1000 === 0) {
      console.log(`Importing data ${index}`);
    }
    const mappedData = mapper(line);
    const parsedData = parser(mappedData);
    await DualControlFormation.create(parsedData);
  });
};

const importer = async () => {
  await DualControlFormation.deleteMany({});

  // await importFromFtp();
  await importFromLocalFile();
};

module.exports = { importer };
