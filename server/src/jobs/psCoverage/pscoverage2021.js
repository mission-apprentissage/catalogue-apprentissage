const XLSX = require("xlsx");
const path = require("path");
const { Readable } = require("stream");
const logger = require("../../common/logger");
const { oleoduc, writeData } = require("oleoduc");
const { runScript } = require("../scriptWrapper");
const { PsFormation } = require("../../common/model");
const { getJsonFromXlsxFile } = require("../../common/utils/fileUtils");
const { getBcnInfo, getMefInfo } = require("../../common/services/tables_correspondance");

const getLibelle = (libelle) => {
  let result = libelle.match(/.*?(?=\s- en apprentissage)/);

  if (!result) return libelle;

  if (result[0].includes("(Bac") || result[0].includes("(BAC")) {
    result = result[0].match(/.*?(?=\s\(bac \+)/i)[0];
    return result;
  }

  return result[0];
};

const exportToXlsx = (data, fileName) => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data), "psup");

  XLSX.writeFileAsync(path.join(__dirname, `/assets/${fileName}.xlsx`), workbook, (e) => {
    if (e) {
      console.log(e);
      throw new Error("La génération du fichier excel à échoué : ", e);
    }
  });
};

const completeFileRun = async () => {
  const filePath = path.resolve(__dirname, "./assets/formation-psup-2021.xls");
  const filePath2 = path.resolve(__dirname, "./assets/psup2021-missing-mef-cfd.xlsx");
  const f2021 = getJsonFromXlsxFile(filePath);
  const f2021CFD = getJsonFromXlsxFile(filePath2);

  const f2020 = await PsFormation.find({}).countDocuments();

  // not used
  const merged = f2021.map((x) => {
    f2021CFD.find((i) => {
      let { UAI_GES, UAI_COMPOSANTE, UAI_AFF, CODESPÉCIALITÉ, CFD } = i;

      if (
        x.UAI_GES === UAI_GES &&
        x.UAI_COMPOSANTE === UAI_COMPOSANTE &&
        x.UAI_AFF === UAI_AFF &&
        x.CODESPÉCIALITÉ === CODESPÉCIALITÉ
      ) {
        x.CFD = CFD ? CFD : null;
      }
    });
    return x;
  });

  const stats = {
    total2020: f2020,
    total2021: merged.length,
    withMEF: 0,
    withCFD: 0,
    withSPE: 0,
    withLABELCP: 0,
    withCP: 0,
    withUAIOnly: 0,
    notFound: 0,
    error: 0,
    bcnMultiple: 0,
    bcnMultipleData: [],
    notFoundData: [],
  };

  await oleoduc(
    Readable.from(f2021),
    writeData(async (formation) => {
      let {
        UAI_GES,
        UAI_COMPOSANTE,
        UAI_AFF,
        CODEMEF,
        LIBSPÉCIALITÉ,
        CODEPOSTAL,
        CODESPÉCIALITÉ,
        CODEDIPLOME_MAP,
      } = formation;
      let CFD;

      if (!CODEDIPLOME_MAP) {
        if (CODEMEF) {
          try {
            let { messages, result } = await getMefInfo(CODEMEF);

            if (messages?.cfdUpdated === "Trouvé") {
              // CODEDIPLOME_MAP = result.cfd.cfd;
              CFD = result.cfd.cfd;
            }
          } catch (error) {
            console.log("ERROR TCO CFD", error);
            stats.error += 1;
          }
        }
      }

      if (CODEMEF) {
        let matchMEF = await PsFormation.findOne({
          uai_gestionnaire: UAI_GES,
          uai_composante: UAI_COMPOSANTE,
          uai_affilie: UAI_AFF,
          code_mef_10: CODEMEF,
        });

        if (matchMEF) {
          stats.withMEF += 1;

          return;
        }
      }

      if (CODEDIPLOME_MAP) {
        let matchCFD = await PsFormation.findOne({
          uai_gestionnaire: UAI_GES,
          uai_composante: UAI_COMPOSANTE,
          uai_affilie: UAI_AFF,
          code_cfd: CODEDIPLOME_MAP,
        });

        if (matchCFD) {
          stats.withCFD += 1;

          return;
        }
      }

      if (CFD) {
        let matchCFD = await PsFormation.findOne({
          uai_gestionnaire: UAI_GES,
          uai_composante: UAI_COMPOSANTE,
          uai_affilie: UAI_AFF,
          code_cfd: CFD,
        });

        if (matchCFD) {
          stats.withCFD += 1;

          return;
        }
      }

      const matchSPE = await PsFormation.findOne({
        uai_gestionnaire: UAI_GES,
        uai_composante: UAI_COMPOSANTE,
        uai_affilie: UAI_AFF,
        code_specialite: CODESPÉCIALITÉ,
      });

      if (matchSPE) {
        stats.withSPE += 1;

        return;
      }

      let LIBELLE_STAT_33 = getLibelle(LIBSPÉCIALITÉ).toUpperCase();

      try {
        const {
          formationsDiplomes,
          pagination: { total },
        } = await getBcnInfo({
          query: { LIBELLE_STAT_33 },
        });

        if (total === 1) CFD = formationsDiplomes[0].FORMATION_DIPLOME;

        if (total > 1) {
          const openFormation = formationsDiplomes.filter((x) => x.DATE_FERMETURE === "");
          if (openFormation.length === 0) {
            stats.bcnMultiple += 1;
            stats.bcnMultipleData.push(formation);

            return;
          }
          CFD = openFormation[0].FORMATION_DIPLOME;
        }
      } catch (error) {
        console.log("ERROR TCO BCN", error);
        stats.error += 1;
      }

      if (CFD) {
        let matchCFD = await PsFormation.findOne({
          uai_gestionnaire: UAI_GES,
          uai_composante: UAI_COMPOSANTE,
          uai_affilie: UAI_AFF,
          code_cfd: CFD,
        });

        if (matchCFD) {
          stats.withCFD += 1;

          return;
        }
      }

      let matchLABELCP = await PsFormation.findOne({
        uai_gestionnaire: UAI_GES,
        uai_composante: UAI_COMPOSANTE,
        uai_affilie: UAI_AFF,
        code_postal: CODEPOSTAL,
        libelle_specialite: LIBSPÉCIALITÉ,
      });

      if (matchLABELCP) {
        stats.withLABELCP += 1;

        return;
      }

      let matchCP = await PsFormation.findOne({
        uai_gestionnaire: UAI_GES,
        uai_composante: UAI_COMPOSANTE,
        uai_affilie: UAI_AFF,
        code_postal: CODEPOSTAL,
      });

      if (matchCP) {
        stats.withCP += 1;

        return;
      }

      let matchUAI = await PsFormation.findOne({
        uai_gestionnaire: UAI_GES,
        uai_composante: UAI_COMPOSANTE,
        uai_affilie: UAI_AFF,
      });

      if (matchUAI) {
        stats.withUAIOnly += 1;

        return;
      }

      stats.notFound += 1;
      stats.notFoundData.push(formation);
    })
  );

  console.log({ stats });

  await exportToXlsx(stats.bcnMultipleData, "result-bcn-multiple");
  await exportToXlsx(stats.notFoundData, "export-not-found");
};

if (process.env.standalone) {
  runScript(async () => {
    logger.info("Start psup 2021");

    await completeFileRun();

    logger.info("End psup 2021");
  });
}
