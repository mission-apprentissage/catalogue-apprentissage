const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { Formation } = require("../../../common/model");
const path = require("path");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const csvToJson = require("convert-csv-to-json-latin");

runScript(async () => {
  logger.info(`Start find edited uai`);
  const file = path.join(__dirname, "uai-edited-2021-12-28.csv");
  console.log("load file", file);
  const jsonUai = csvToJson.getJsonFromCsv(file);
  console.log(jsonUai.length);
  console.log(jsonUai[0]);

  const res = [];

  // find those who are still empty in prod
  await asyncForEach(jsonUai, async ({ uai_formation, cle_ministere_educatif }) => {
    const f = await Formation.findOne({ cle_ministere_educatif });
    if (!f) {
      return;
    }

    if (f?.editedFields?.uai_formation && `${uai_formation}` !== `${f?.editedFields?.uai_formation}`) {
      console.warn("! different uais ! ", cle_ministere_educatif, uai_formation, f?.editedFields?.uai_formation);
    }

    if (!f?.editedFields?.uai_formation) {
      res.push({ cle_ministere_educatif, uai_formation });

      f.editedFields = {
        uai_formation: uai_formation,
      };

      await f.save();
    }
  });

  console.log("finished restore uais", res.length);

  logger.info(`End find edited uai`);
});
