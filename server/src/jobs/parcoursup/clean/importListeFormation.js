const { oleoduc, writeData, transformData, compose } = require("oleoduc");
const { createReadStream } = require("fs");

const { runScript } = require("../../scriptWrapper");
const { omitEmpty } = require("../../../common/utils/objectUtils");
const logger = require("../../../common/logger");
const { ParcoursupFormationCheck } = require("../../../common/models");
const { parseCsv } = require("../../../common/utils/csvUtils");

const transformStream = (data) => {
  return {
    uai_ges: data["UAI_GES"],
    uai_composante: data["UAI_COMPOSANTE"],
    lib_composante: data["LIB_COMPOSANTE"],
    lib_ins: data["LIB_INS"],
    uai_aff: data["UAI_AFF"],
    lib_aff: data["LIB_AFF"],
    codecommune: data["CODECOMMUNE"],
    libcommune: data["LIBCOMMUNE"],
    codepostal: data["CODEPOSTAL"],
    académie: data["ACADÉMIE"],
    ministeretutelle: data["MINISTERETUTELLE"],
    libministere: data["LIBMINISTERE"],
    typeeta: data["TYPEETA"],
    codeformation: data["CODEFORMATION"],
    libformation: data["LIBFORMATION"],
    codespécialité: data["CODESPÉCIALITÉ"],
    libspécialité: data["LIBSPÉCIALITÉ"],
    codespéformationinitiale: data["CODESPÉFORMATIONINITIALE"],
    codemef: data["CODEMEF"],
    uai_insert: data["UAI_INSERT"],
    uai_cerfa: data["UAI_CERFA"],
    siret_cerfa: data["SIRET_CERFA"],
    uai_map: data["UAI_MAP"],
    siret_map: data["SIRET_MAP"],
    codediplome_map: data["CODEDIPLOME_MAP"],
    codeformationinscription: data["CODEFORMATIONINSCRIPTION"],
    codeformationaccueil: data["CODEFORMATIONACCUEIL"],
    latitude: data["LATITUDE"],
    longitude: data["LONGITUDE"],
    complementadresse: data["COMPLEMENTADRESSE"],
    complementadresse1: data["COMPLEMENTADRESSE1"],
    complementadresse2: data["COMPLEMENTADRESSE2"],
    complementcodepostal: data["COMPLEMENTCODEPOSTAL"],
    complementcommune: data["COMPLEMENTCOMMUNE"],
    complementcedex: data["COMPLEMENTCEDEX"],
    premiereligneadresseetab: data["PREMIERELIGNEADRESSEETAB"],
    secondeligneadresseetab: data["SECONDELIGNEADRESSEETAB"],
    id_rco: data["ID_RCO"],
    flag_certif: data["FLAG_CERTIF"],
  };
};

/**
 * Import d'un fichier mettant en relation ID_RCO (cle_ministere_educatif) et GT_A_code (parcoursup_id) à des fins de comparaison et d'analyse
 * @param {*} csv
 * @returns
 */
async function importListeFormation(csv) {
  const stream = compose(
    csv,
    parseCsv({
      on_record: (record) => omitEmpty(record),
    }),
    transformData(transformStream)
  );

  if (ParcoursupFormationCheck.countDocuments({})) {
    console.log("Removing old data");
    await ParcoursupFormationCheck.deleteMany({});
  }

  const stats = {
    total: 0,
    created: 0,
    failed: 0,
  };

  console.log("Reading stream");

  await oleoduc(
    stream,
    writeData(
      async (data) => {
        try {
          const res = await ParcoursupFormationCheck.create(data);

          stats.created++;
          console.info(`Ligne ${res.codeformationinscription} créée`);
        } catch (e) {
          stats.failed++;
          logger.error({ type: "job" }, `Impossible de traiter la ligne : \n${data}`, e);
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
}

if (process.env.standalone) {
  runScript(async () => {
    const args = process.argv.slice(2);
    const csv = args[0];
    if (!csv) {
      throw Error("No csv file specified");
    }

    logger.info({ type: "job" }, " -- Start database import -- ");

    await importListeFormation(createReadStream(csv));

    logger.info({ type: "job" }, " -- End database import -- ");
  });
}
