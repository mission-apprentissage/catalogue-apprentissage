const { Formation } = require("../../../common/models");
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { createReadStream } = require("fs");
const { parseCsv } = require("../../../common/utils/csvUtils");
const { transformData, compose, writeData, oleoduc, filterData } = require("oleoduc");
const { omitEmpty } = require("../../../common/utils/objectUtils");

const transformStream = (data) => {
  console.log(data);
  return {
    cles_ministere_educatif: data["cles_ministere_educatif"].split(","),
    parcoursup_id: data["parcoursup_id"],
  };
};

const run = async (csv) => {
  try {
    const stream = compose(
      csv,
      parseCsv({
        delimiter: ";",
        on_record: (record) => omitEmpty(record),
      }),
      transformData(transformStream),
      filterData(({ cles_ministere_educatif }) => !!cles_ministere_educatif && !!cles_ministere_educatif.length)
    );

    await oleoduc(
      stream,
      writeData(
        async ({ cles_ministere_educatif, parcoursup_id }) => {
          try {
            console.log({ cles_ministere_educatif, parcoursup_id });

            await Formation.updateMany({ cle_ministere_educatif: { $in: cles_ministere_educatif } }, { parcoursup_id });
          } catch (err) {
            console.error(err);
          }
        },
        { parallel: 10 }
      )
    );
  } catch (error) {
    logger.error({ type: "job" }, error);
  }
};

if (process.env.standalone) {
  runScript(async () => {
    logger.info({ type: "job" }, " -- Start formation parcoursup_id integration -- ");
    const args = process.argv.slice(2);
    const csv = args[0];
    if (!csv) {
      throw Error("No csv file specified");
    }
    await run(createReadStream(csv));

    logger.info({ type: "job" }, " -- End formation parcoursup_id integration -- ");
  });
}
