const path = require("path");
const logger = require("../../common/logger");
const { PsFormation } = require("../../common/model");
const { getJsonFromXlsxFile } = require("../../common/utils/fileUtils");
const { runScript } = require("../scriptWrapper");
const { Readable } = require("stream");
const { oleoduc, writeData } = require("oleoduc");
const XLSX = require("xlsx");

const getLibelle = (libelle) => {
  let result = libelle.match(/.*?(?=\s- en apprentissage)/);

  if (!result) return libelle;

  if (result[0].includes("(Bac") || result[0].includes("(BAC")) {
    result = result[0].match(/.*?(?=\s\(bac \+)/i)[0];
    return result;
  }

  return result[0];
};

const run = async (tableCorrespondance) => {
  const filePath = path.resolve(__dirname, "./assets/formation-psup-2021.xls");
  const f2021 = getJsonFromXlsxFile(filePath);

  let notFound = [];

  const f2020 = await PsFormation.find({});

  const stats = {
    total2020: f2020.length,
    total2021: f2021.length,
    existingWithMef: 0,
    new: 0,
    existingWithCfd: 0,
    notFound: 0,
    existingUAIOnly: 0,
    existingUAICP: 0,
  };

  await oleoduc(
    Readable.from(f2021),
    writeData(async (formation) => {
      let { UAI_GES, UAI_COMPOSANTE, UAI_AFF, CODEMEF, LIBSPÉCIALITÉ, CODEPOSTAL } = formation;

      if (CODEMEF) {
        let matchMEF = await PsFormation.find({
          uai_gestionnaire: UAI_GES,
          uai_composante: UAI_COMPOSANTE,
          uai_affilie: UAI_AFF,
          code_mef_10: CODEMEF,
        });

        if (!matchMEF) {
          stats.new += 1;
        }

        stats.existingWithMef += 1;
        return;
      }

      let matchCP = await PsFormation.find({
        uai_gestionnaire: UAI_GES,
        uai_composante: UAI_COMPOSANTE,
        uai_affilie: UAI_AFF,
        code_postal: CODEPOSTAL,
      });

      // console.log("matchCP", matchCP);

      if (matchCP.length > 1) {
        stats.existingUAICP += 1;
        return;
      }

      let LIBELLE_STAT_33 = getLibelle(LIBSPÉCIALITÉ).toUpperCase();

      // console.log({
      //   LIBSPÉCIALITÉ,
      //   LIBELLE_STAT_33,
      // });

      let code_cfd;

      const {
        formationsDiplomes,
        pagination: { total },
      } = await tableCorrespondance.getBcnInfo({
        query: { LIBELLE_STAT_33 },
      });

      // console.log(total);

      if (total === 0) {
        console.log("formation", formation);
        notFound.push(formation);
        stats.notFound += 1;
        return;
      }

      if (total === 1) code_cfd = formationsDiplomes[0].FORMATION_DIPLOME;

      if (total > 1) {
        const openFormation = formationsDiplomes.filter((x) => x.DATE_FERMETURE === "");
        if (openFormation.length === 0) return null;
        code_cfd = openFormation[0].FORMATION_DIPLOME;
      }

      let matchCFD = await PsFormation.find({
        uai_gestionnaire: UAI_GES,
        uai_composante: UAI_COMPOSANTE,
        uai_affilie: UAI_AFF,
        code_cfd,
      });

      if (matchCFD) {
        stats.existingWithCfd += 1;
        return;
      }

      console.log("formation-end", formation);
      notFound.push(formation);
      stats.notFound += 1;
    })
  );

  console.log("stats", stats);
  console.log("notFound.length", notFound.length);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(notFound), "psup");

  XLSX.writeFileAsync(path.join(__dirname, `/assets/export-psup2021-missing-mef-cfd.xlsx`), workbook, (e) => {
    if (e) {
      console.log(e);
      throw new Error("La génération du fichier excel à échoué : ", e);
    }
  });
};

if (process.env.standalone) {
  runScript(async ({ tableCorrespondance }) => {
    logger.info("Start psup 2021");

    await run(tableCorrespondance);

    logger.info("End psup 2021");
  });
}
