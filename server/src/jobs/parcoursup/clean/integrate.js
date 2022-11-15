const { Formation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { createReadStream } = require("fs");
const { parseCsv } = require("../../../common/utils/csvUtils");
const { transformData, compose, writeData, oleoduc, filterData } = require("oleoduc");
const { omitEmpty } = require("../../../common/utils/objectUtils");

const transformStream = (data) => {
  return {
    cle_ministere_educatif: data["Clé_ME"],
    parcoursup_id: data["parcoursup_id"],
  };
};

const run = async (csv) => {
  try {
    const stream = compose(
      csv,
      parseCsv({
        on_record: (record) => omitEmpty(record),
      }),
      transformData(transformStream),
      filterData(({ cle_ministere_educatif }) => !!cle_ministere_educatif)
    );

    await oleoduc(
      stream,
      writeData(
        async ({ cle_ministere_educatif, parcoursup_id }) => {
          try {
            console.log({ cle_ministere_educatif, parcoursup_id });

            await Formation.updateOne({ cle_ministere_educatif }, { parcoursup_id });
          } catch (err) {
            console.error(err);
          }
        },
        { parallel: 10 }
      )
    );
  } catch (err) {
    logger.error(err);
  }
};

if (process.env.standalone) {
  runScript(async () => {
    logger.info(" -- Start formation parcoursup_id integration -- ");
    const args = process.argv.slice(2);
    const csv = args[0];
    if (!csv) {
      throw Error("No csv file specified");
    }
    await run(createReadStream(csv));

    logger.info(" -- End formation parcoursup_id integration -- ");
  });
}
