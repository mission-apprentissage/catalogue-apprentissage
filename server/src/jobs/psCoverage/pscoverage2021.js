const path = require("path");
const logger = require("../../common/logger");
const { PsFormation } = require("../../common/model");
const { getJsonFromXlsxFile } = require("../../common/utils/fileUtils");
const { runScript } = require("../scriptWrapper");
const { Readable } = require("stream");

const { oleoduc, writeData } = require("oleoduc");

const getLibelle = (libelle) => {
  let result = libelle.match(/.*?(?=\s- en apprentissage)/);

  if (!result) return libelle;

  if (result[0].includes("(Bac") || result[0].includes("(BAC")) {
    console.log("result[0]----", result[0]);
    result = result[0].match(/.*?(?=\s\(bac \+)/i)[0];
    return result;
  }

  return result[0];
};

const run = async (tableCorrespondance) => {
  const filePath = path.resolve(__dirname, "./assets/formation-psup-2021.xls");
  const f2021 = getJsonFromXlsxFile(filePath);

  const f2020 = await PsFormation.find({});

  const stats = {
    total2020: f2020.length,
    total2021: f2021.length,
    existing: 0,
    new: 0,
    existUAI: 0,
  };

  await oleoduc(
    Readable.from(f2021),
    writeData(async (formation) => {
      let { UAI_GES, UAI_COMPOSANTE, UAI_AFF, CODEMEF, LIBSPÉCIALITÉ } = formation;

      if (CODEMEF) {
        let found = await PsFormation.find({
          uai_gestionnaire: UAI_GES,
          uai_composante: UAI_COMPOSANTE,
          uai_affilie: UAI_AFF,
          code_mef_10: CODEMEF,
        });

        if (found) {
          stats.existing += 1;
        } else {
          stats.new += 1;
        }
      } else {
        if (LIBSPÉCIALITÉ) {
          let LIBELLE_STAT_33 = getLibelle(LIBSPÉCIALITÉ).toUpperCase();

          console.log({
            LIBSPÉCIALITÉ,
            LIBELLE_STAT_33,
          });

          let code_cfd;

          const {
            formationsDiplomes,
            pagination: { total },
          } = await tableCorrespondance.getBcnInfo({
            query: { LIBELLE_STAT_33 },
          });

          console.log(total);

          if (total === 0) return null;

          if (total > 1) {
            const openFormation = formationsDiplomes.filter((x) => x.DATE_FERMETURE === "");
            if (openFormation.length === 0) return null;
            return openFormation[0].FORMATION_DIPLOME;
          }

          code_cfd = formationsDiplomes[0].FORMATION_DIPLOME;

          let found = await PsFormation.find({
            uai_gestionnaire: UAI_GES,
            uai_composante: UAI_COMPOSANTE,
            uai_affilie: UAI_AFF,
            code_cfd,
          });

          console.log("found", found);

          if (found) {
            stats.existing += 1;
          } else {
            stats.new += 1;
          }
        } else {
          let found = await PsFormation.find({
            uai_gestionnaire: UAI_GES,
            uai_composante: UAI_COMPOSANTE,
            uai_affilie: UAI_AFF,
          });

          if (found) {
            stats.existing += 1;
          } else {
            stats.new += 1;
          }
        }
      }
    })
  );

  console.log("stats", stats);

  // await asyncForEach(f2021, async ({ UAI_GES, UAI_COMPOSANTE, UAI_AFF, CODEMEF }) => {
  //   console.log("formation", formation);
  // });
};

if (process.env.standalone) {
  runScript(async ({ tableCorrespondance }) => {
    logger.info("Start psup 2021");

    await run(tableCorrespondance);

    logger.info("End psup 2021");
  });
}
