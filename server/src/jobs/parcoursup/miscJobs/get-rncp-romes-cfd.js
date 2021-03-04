const path = require("path");
const XLSX = require("xlsx");
const { uniqBy } = require("lodash");
const { runScript } = require("../../scriptWrapper");
const { paginator } = require("../../common/utils/paginator");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { getJsonFromXlsxFile } = require("../../../common/utils/fileUtils");
const { AfReconciliation, ConvertedFormation } = require("../../../common/model");
const { getCfdInfo, getMefInfo, getBcnInfo } = require("../../../common/services/tables_correspondance");

runScript(async () => {
  await psup2021();
});

// eslint-disable-next-line
function recoupementAvecFichierSpecific() {
  const fichierSerge = path.resolve(__dirname, "../assets/traitement-psup-serge.xlsx");
  const fichierAnne = path.resolve(__dirname, "../assets/recoupement-rncp-romes.xlsx");
  const dataSerge = getJsonFromXlsxFile(fichierSerge);
  const dataAnne = getJsonFromXlsxFile(fichierAnne);

  let stat = {
    found: 0,
    cfd: 0,
    rncp: 0,
    rome: 0,
    mef: 0,
  };

  const matched = dataSerge.map((formation) => {
    let found = dataAnne.find((x) => x.LIBSPÉCIALITÉ === formation.LIBSPÉCIALITÉ);
    if (found) {
      stat.found += 1;

      if (formation.CODE_CFD_MNA == "Non trouvé" && found.CODE_CFD) {
        formation.CODE_CFD_MNA = found.CODE_CFD;
        stat.cfd += 1;
      }

      if (formation.CODE_RNCP == "Non trouvé" && found.CODE_RNCP) {
        formation.CODE_RNCP = found.CODE_RNCP;
        stat.rncp += 1;
      }

      if (formation.CODE_ROME == "Non trouvé" && found.CODE_ROME) {
        formation.CODE_ROME = found.CODE_ROME;
        stat.rome += 1;
      }

      if (formation.CODEMEF == "Non trouvé" && found.CODEMEF) {
        formation.CODEMEF = found.CODEMEF;
        stat.mef += 1;
      }
    }
    return formation;
  });

  console.log({ stat, l: matched.length });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(matched), "psup");

  XLSX.writeFileAsync(path.join(__dirname, `../assets/traitement-psup-serge-20210304.xlsx`), workbook, (e) => {
    if (e) {
      console.log(e);
      throw new Error("La génération du fichier excel à échoué : ", e);
    }
  });
}

async function psup2021() {
  const file = path.resolve(__dirname, "../assets/formation-psup-2021_26022021.xls");
  const data = getJsonFromXlsxFile(file);

  const filtered = uniqBy(data, "CODESPÉCIALITÉ");

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

          if (openFormation.length > 0) {
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
        } catch (error) {
          console.log("getBcnInfo", error);
        }
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
