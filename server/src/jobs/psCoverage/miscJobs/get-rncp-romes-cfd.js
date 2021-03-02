const path = require("path");
const XLSX = require("xlsx");
const { uniqBy } = require("lodash");
const { runScript } = require("../../scriptWrapper");
const { paginator } = require("../../common/utils/paginator");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { getJsonFromXlsxFile } = require("../../../common/utils/fileUtils");
const { AfReconciliation, ConvertedFormation } = require("../../../common/model");
const { getCfdInfo, getMefInfo } = require("../../../common/services/tables_correspondance");

runScript(async () => {
  await psup2021();
});

async function psup2021() {
  const file = path.resolve(__dirname, "../assets/formation-psup-2021_26022021.xls");
  const data = getJsonFromXlsxFile(file);

  const filtered = uniqBy(data, "CODESPÉCIALITÉ");

  let updated = [];

  await asyncForEach(filtered, async (item, index) => {
    console.log(index, filtered.length);
    if (item.CODEMEF) {
      try {
        let responseMEF = await getMefInfo(item.CODEMEF);
        // console.log("responseMEF", responseMEF);
        if (responseMEF) {
          let romes = responseMEF.result.rncp?.romes?.map((x) => x.rome);
          item.CODE_RNCP = responseMEF.result.rncp?.code_rncp || "Non trouvé";
          item.CODE_ROME = romes ? romes.join() : "Non trouvé";
          item.CODE_CFD_MNA = responseMEF.result.cfd?.cfd || "Non trouvé";

          if (
            responseMEF.messages.rncp.error === "Erreur: Non trouvé" &&
            responseMEF.messages.cfdUpdated === "Trouvé"
          ) {
            console.log("coucou");
            let responseCFD = await getCfdInfo(item.CODE_CFD_MNA);

            if (responseCFD) {
              let romes = responseCFD.result.rncp?.romes?.map((x) => x.rome);
              item.CODE_RNCP = responseCFD.result.rncp?.code_rncp || "Non trouvé";
              item.CODE_ROME = romes ? romes.join() : "Non trouvé";
            }
          }

          updated.push(item);
        }
      } catch (error) {
        console.log("getMefInfo", error);
      }
      return;
    }

    if (item.CODEDIPLOME_MAP) {
      console.log(item.CODEDIPLOME_MAP);
      try {
        let responseCFD = await getCfdInfo(item.CODEDIPLOME_MAP);
        // console.log("responseCFD", responseCFD);

        if (responseCFD) {
          // if (responseCFD.messages.cfd?.includes("Trouvé")) {
          let romes = responseCFD.result.rncp?.romes?.map((x) => x.rome);

          item.CODE_CFD_MNA = responseCFD.result.cfd || "Non trouvé";
          item.CODE_RNCP = responseCFD.result.rncp?.code_rncp || "Non trouvé";
          item.CODE_ROME = romes ? romes.join() : "Non trouvé";
          // }

          updated.push(item);
        }
      } catch (error) {
        console.log("getCfdInfo", error);
      }
      return;
    }

    item.CODE_RNCP = "Non trouvé";
    item.CODE_ROME = "Non trouvé";
    item.CODE_CFD_MNA = "Non trouvé";
    updated.push(item);
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(updated), "psup");

  XLSX.writeFileAsync(path.join(__dirname, `../assets/traitement-psup-serge.xlsx`), workbook, (e) => {
    if (e) {
      console.log(e);
      throw new Error("La génération du fichier excel à échoué : ", e);
    }
  });
}
// eslint-disable-next-line
async function statistiqueAffelnet() {
  let stats = {
    found: [],
    notfound: [],
    published: 0,
    notPublished: 0,
  };

  await paginator(AfReconciliation, {}, async (x) => {
    let cv = await ConvertedFormation.findOne({
      cfd: x.code_cfd,
      etablissement_formateur_siret: x.siret_formateur,
      etablissement_gestionnaire_siret: x.siret_gestionnaire,
    });

    if (cv) {
      stats.found.push(cv);
      if (cv.published === true) {
        stats.published += 1;
      } else {
        stats.notPublished += 1;
      }
    } else {
      // console.log("missing", x);
      stats.notfound.push(x);
    }
  });

  stats.foundln = stats.found.length;
  stats.notFoundln = stats.notfound.length;

  console.log({ stats });
}
