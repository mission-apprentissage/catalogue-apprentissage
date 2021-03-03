const path = require("path");
const XLSX = require("xlsx");
const { uniqBy } = require("lodash");
const { runScript } = require("../../scriptWrapper");
const stringSimilarity = require("string-similarity");
const { paginator } = require("../../common/utils/paginator");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { getJsonFromXlsxFile } = require("../../../common/utils/fileUtils");
const { AfReconciliation, ConvertedFormation } = require("../../../common/model");
const { getCfdInfo, getMefInfo, getBcnInfo } = require("../../../common/services/tables_correspondance");

runScript(async () => {
  await psup2021();
});

const getLibelleLong = (libelle) =>
  libelle
    .split(" - en apprentissage")[0]
    .replace(/\((.)*\)+/g, "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

const getLibelleCourt = (libelle) => {
  if (libelle.includes("BUT")) return "DUT";
  if (libelle.includes("Formation professionnelle")) return "";
  if (libelle.includes("Formations  des écoles d'ingénieurs")) return "";
  if (libelle.includes("Certificat de Spécialisation Agricole")) return "";
  if (libelle.includes("BPJEPS")) return "";
  if (libelle.includes("Sous-officier")) return "";
};

async function psup2021() {
  const file = path.resolve(__dirname, "../assets/formation-psup-2021_26022021.xls");
  const data = getJsonFromXlsxFile(file);
  const bcnDb = await getBcnInfo({ query: {}, limit: 10000 });

  const bcnClean = bcnDb.formationsDiplomes.filter((x) => x.LIBELLE_LONG_200 !== "" && x.LIBELLE_LONG_200 !== null);
  const labels = bcnClean.map((x) => x.LIBELLE_LONG_200);

  const filtered = uniqBy(data, "CODESPÉCIALITÉ");

  let updated = [];

  await asyncForEach(filtered, async (item, index) => {
    console.log(index, filtered.length);
    if (item.CODEMEF) {
      try {
        let responseMEF = await getMefInfo(item.CODEMEF);

        if (responseMEF) {
          let romes = responseMEF.result.rncp?.romes?.map((x) => x.rome);
          item.CODE_RNCP = responseMEF.result.rncp?.code_rncp ?? "Non trouvé";
          item.CODE_ROME = romes ? romes.join() : "Non trouvé";
          item.CODE_CFD_MNA = responseMEF.result.cfd?.cfd ?? "Non trouvé";

          if (
            responseMEF.messages.rncp.error === "Erreur: Non trouvé" &&
            responseMEF.messages.cfdUpdated === "Trouvé"
          ) {
            let responseCFD = await getCfdInfo(item.CODE_CFD_MNA);

            if (responseCFD) {
              let romes = responseCFD.result.rncp?.romes?.map((x) => x.rome);
              item.CODE_RNCP = responseCFD.result.rncp?.code_rncp ?? "Non trouvé";
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

        if (responseCFD) {
          let romes = responseCFD.result.rncp?.romes?.map((x) => x.rome);

          item.CODE_CFD_MNA = responseCFD.result.cfd ?? "Non trouvé";
          item.CODE_RNCP = responseCFD.result.rncp?.code_rncp ?? "Non trouvé";
          item.CODE_ROME = romes ? romes.join() : "Non trouvé";

          updated.push(item);
        }
      } catch (error) {
        console.log("getCfdInfo", error);
      }
      return;
    }

    if (!item.CODEMEF && !item.CODE_CFD_MNA) {
      let LIBELLE_LONG_200 = getLibelleLong(item.LIBSPÉCIALITÉ);
      let LIBELLE_COURT = getLibelleCourt(item.LIBFORMATION);

      try {
        const {
          formationsDiplomes,
          pagination: { total },
        } = await getBcnInfo({ query: { LIBELLE_LONG_200 } });

        if (total > 0) {
          const openFormation = formationsDiplomes.filter((x) => x.LIBELLE_COURT === LIBELLE_COURT);

          if (openFormation.length === 0) {
            let match = [];

            let { bestMatch, bestMatchIndex } = stringSimilarity.findBestMatch(LIBELLE_LONG_200, labels);

            if (bestMatch.rating > 0.75) {
              match.push({
                bestMatch,
                data: bcnClean[bestMatchIndex],
              });
            }

            let found = match.filter((x) => x.data.LIBELLE_COURT === LIBELLE_COURT);

            if (found.length > 0) {
              console.log("found", found);
              item.CODE_CFD_MNA = found[0].FORMATION_DIPLOME;
            }

            if (found.length === 0 && match.length > 0) {
              console.log("match but not found", match);
              item.CODE_CFD_MNA = match[0].FORMATION_DIPLOME;
            }
          } else {
            item.CODE_CFD_MNA = openFormation[0].FORMATION_DIPLOME;
          }
        }
      } catch (error) {
        console.log("getBcnInfo", error);
      }

      if (item.CODE_CFD_MNA) {
        try {
          let responseCFD = await getCfdInfo(item.CODE_CFD_MNA);

          if (responseCFD) {
            let romes = responseCFD.result.rncp?.romes?.map((x) => x.rome);
            item.CODE_RNCP = responseCFD.result.rncp?.code_rncp ?? "Non trouvé";
            item.CODE_ROME = romes ? romes.join() : "Non trouvé";
          }
          updated.push(item);

          return;
        } catch (error) {
          console.log("getBcnInfo", error);
        }
      }
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
