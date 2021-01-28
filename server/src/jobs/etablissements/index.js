const https = require("https");
const config = require("config");
const { Readable } = require("stream");
const { oleoduc, writeData, accumulateData } = require("oleoduc");
const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const { Etablissement } = require("../../common/model");
const { parse: parseUrl } = require("url"); // eslint-disable-line node/no-deprecated-api

const getEtablissements = async () => {
  let httpResponse = await new Promise((resolve, reject) => {
    let options = {
      ...parseUrl(`${config.tableCorrespondance.endpoint}/api/entity/etablissements?limit=10000`),
      method: "GET",
    };

    let req = https.request(options, (res) => {
      if (res.statusCode >= 400) {
        reject(new Error(`Unable to request TCO etablissement`));
      }

      resolve(res);
    });
    req.end();
  });

  let etablissements = [];
  await oleoduc(
    httpResponse,
    accumulateData((acc, data) => acc + data, { accumulator: "" }),
    writeData((data) => {
      let { etablissements: res } = JSON.parse(data.toString());
      etablissements = res;
    })
  );
  return etablissements;
};

runScript(async () => {
  let stats = {
    total: 0,
    created: 0,
    failed: 0,
  };

  let etablissements = await getEtablissements();

  logger.info("Deleting all etablissements...");
  await Etablissement.deleteMany({});

  logger.info(`Inserting ${etablissements.length} etablissements...`);
  await oleoduc(
    Readable.from(etablissements),
    writeData(
      async (e) => {
        stats.total++;
        try {
          delete e._id;
          await Etablissement.create(e);
          stats.created++;
        } catch (e) {
          stats.failed++;
          logger.error(e);
        }
      },
      { parallel: 5 }
    )
  );

  return stats;
});
