const path = require("path");
const { runScript } = require("../../scriptWrapper");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { createXlsxFromJson } = require("../../../common/utils/fileUtils");
const { getMef10Info, getModels, getRncpInfo, getCfdInfo } = require("@mission-apprentissage/tco-service-node");
const { getJsonFromXlsxFile } = require("../../../common/utils/fileUtils");
const { downloadAndSaveFileFromS3 } = require("../../../common/utils/awsUtils");
const { orderBy } = require("lodash");

let Models = null;

const createWorkingTable = (formationsPs) => {
  const specialitePsRawData = formationsPs.map((f) => ({
    // eslint-disable-next-line prettier/prettier
    CODESPÉCIALITÉ: f["CODESPÉCIALITÉ"],
    // eslint-disable-next-line prettier/prettier
    LIBSPÉCIALITÉ: f["LIBSPÉCIALITÉ"],
    CODEMEF: f.CODEMEF || null,
    CODE_CFD_MNA: null,
    CODE_RNCP_MNA: null,
    CODE_ROMES_MNA: null,
    TYPE_RAPPROCHEMENT_MNA: null,
    TEMP_SUBS: [],
  }));

  // eslint-disable-next-line no-unused-vars
  const groupByUniq = specialitePsRawData.reduce((acc, current) => {
    const exist = acc.find((previous) => {
      return (
        previous["CODESPÉCIALITÉ"] === current["CODESPÉCIALITÉ"] &&
        previous["LIBSPÉCIALITÉ"] === current["LIBSPÉCIALITÉ"]
      );
    });
    return exist ? acc : [...acc, current];
  }, []);

  return groupByUniq;
};

const generateSpeTableFile = async (speTable) => {
  const specialiteOutput = [];
  for (let index = 0; index < speTable.length; index++) {
    const { TEMP_SUBS, ...rest } = speTable[index];
    specialiteOutput.push({
      CODESPÉCIALITÉ: rest.CODESPÉCIALITÉ,
      LIBSPÉCIALITÉ: rest.LIBSPÉCIALITÉ,
      CODEMEF: rest.CODEMEF,
      CODE_CFD_MNA: rest.CODE_CFD_MNA,
      CODE_RNCP_MNA: rest.CODE_RNCP_MNA,
      CODE_ROMES_MNA: rest.CODE_ROMES_MNA,
      TYPE_RAPPROCHEMENT_MNA: rest.TYPE_RAPPROCHEMENT_MNA,
    });
    if (TEMP_SUBS.length > 0) {
      specialiteOutput.push({
        // eslint-disable-next-line prettier/prettier
        CODESPÉCIALITÉ: "",
        // eslint-disable-next-line prettier/prettier
        LIBSPÉCIALITÉ: "sousLibelle",
        CODEMEF: "",
        CODE_CFD_MNA: "CODE_CFD_MNA",
        CODE_RNCP_MNA: "CODE_RNCP_MNA",
        CODE_ROMES_MNA: "CODE_ROMES_MNA",
        TYPE_RAPPROCHEMENT_MNA: "TYPE_RAPPROCHEMENT_MNA",
      });
      for (let j = 0; j < TEMP_SUBS.length; j++) {
        const l = TEMP_SUBS[j];
        specialiteOutput.push({
          // eslint-disable-next-line prettier/prettier
          CODESPÉCIALITÉ: "",
          // eslint-disable-next-line prettier/prettier
          LIBSPÉCIALITÉ: l.sousLibelle,
          CODEMEF: "",
          CODE_CFD_MNA: l.CODE_CFD_MNA,
          CODE_RNCP_MNA: l.CODE_RNCP_MNA,
          CODE_ROMES_MNA: l.CODE_ROMES_MNA,
          TYPE_RAPPROCHEMENT_MNA: l.TYPE_RAPPROCHEMENT_MNA,
        });
      }
    }
  }

  await createXlsxFromJson(specialiteOutput, path.join(__dirname, "/Table-ParcourSup-Spécialités-xxxx.xlsx"));
};

const getRncpRomesFromSDKresponse = ({ result: { rncp: rncpInfo } }) => ({
  CODE_RNCP_MNA: rncpInfo?.code_rncp ?? null,
  CODE_ROMES_MNA: rncpInfo?.romes ? rncpInfo?.romes.map((x) => x.rome).join() : null,
});

const findByMef = async ({ CODEMEF }) => {
  let result = { CODE_CFD_MNA: null, CODE_RNCP_MNA: null, CODE_ROMES_MNA: null, TYPE_RAPPROCHEMENT_MNA: null };
  if (!CODEMEF) return result;

  try {
    let responseMEF = await getMef10Info(CODEMEF);
    if (responseMEF.result.cfd && responseMEF.result.cfd?.cfd !== "") {
      result = {
        CODE_CFD_MNA: responseMEF.result.cfd?.cfd ?? null,
        ...getRncpRomesFromSDKresponse(responseMEF),
        TYPE_RAPPROCHEMENT_MNA: "CODEMEF",
      };
    }
  } catch (error) {
    console.log("findByMef", error);
  }
  return result;
};

const customTemporaryMarker = "*#*#*";

const normalizeStr = (str) => {
  return str
    .replace("(ne)", `${customTemporaryMarker}ne${customTemporaryMarker}`)
    .replace("(e)", `${customTemporaryMarker}e${customTemporaryMarker}`)
    .replace("(se)", `${customTemporaryMarker}se${customTemporaryMarker}`)
    .replace(/\((.)*\)+/g, "")
    .replace("(Bac +3", "")
    .replace(`${customTemporaryMarker}ne${customTemporaryMarker}`, "(ne)")
    .replace(`${customTemporaryMarker}e${customTemporaryMarker}`, "(e)")
    .replace(`${customTemporaryMarker}se${customTemporaryMarker}`, "(se)")
    .replace(`${customTemporaryMarker} bâtiment et travaux publics`, "- bâtiment et travaux publics")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const extractSubLibSpecialite = (libSpecialite) => {
  const [main, ...restRaw] = libSpecialite
    .replace(/^TP - /, "")
    .replace("- bâtiment et travaux publics", `${customTemporaryMarker} bâtiment et travaux publics`)
    .split(" - ");

  let recompose = [];
  for (let ite = 0; ite < restRaw.length; ite++) {
    let current = restRaw[ite];
    let hasApprentissage = !!(/en apprentissage Parcours :/gi.exec(current) || /en apprentissage/gi.exec(current));
    current = restRaw[ite].replace("en apprentissage Parcours :", "");
    current = current.replace("Parcours :", "");
    current = current.replace("en apprentissage", "");
    if (current !== "") {
      recompose.push({ intitule: `${normalizeStr(main)} : ${normalizeStr(current).toLowerCase()}`, hasApprentissage });
    } else {
      recompose.push({ intitule: `${normalizeStr(main)}`, hasApprentissage });
    }
  }

  // Just to be sure - edge case eventually
  if (restRaw.length === 0) {
    recompose.push({ intitule: `${normalizeStr(main)}`, hasApprentissage: false });
    console.log(`recomposeLibSpecialite: edge case`, recompose);
  }

  recompose = orderBy(recompose, ["hasApprentissage"], ["desc"]);
  return recompose;
};

// const getTypeCertif = (libelle) => {
//   if (libelle.includes("BUT")) return "BUT";
//   if (libelle.includes("DUT")) return "DUT";
//   if (libelle.includes("Formation professionnelle")) return "Formation professionnelle";
//   // Titre professionnel  // Autre // MASTER // "BP" // BTS // "Licence Professionnelle" // "Titre ingénieur" // null
//   // "BAC PRO" // LICENCE // BEPA // CAP // TP // BT // MC4 // MC5 // BEES // DIPLOVIS // BMA // BEP // DipViGrM
//   // BTSA // DGE_GM // BAPAAT // DEUST // BTSMarit // DE // CS // CAPA // BPA // BTA // DOCTORAT //BEATEP // Grade_Master
//   // DEAVS // DMA // DEDPAD  // CAPD // CEAV // BTn // DSTS // CP // DNMADE // DEA // Grade_Licence
//   // DEEA
//   if (libelle.includes("Formations  des écoles d'ingénieurs")) return "Formations  des écoles d'ingénieurs";
//   if (libelle.includes("Certificat de Spécialisation Agricole")) return "Certificat de Spécialisation Agricole";
//   if (libelle.includes("BPJEPS")) return "BPJEPS";
//   if (libelle.includes("Sous-officier")) return "Sous-officier";
// };

// eslint-disable-next-line no-unused-vars
const findByIntituleInRNCP = async (formationPsRawData) => {
  const [firstSubLib, ...restSubLib] = extractSubLibSpecialite(formationPsRawData["LIBSPÉCIALITÉ"]);

  const matchFirstSubLib = await Models.FicheRncp.find({
    intitule_diplome: new RegExp(`${firstSubLib.intitule}`),
  }).lean();

  if (matchFirstSubLib.length === 1 && restSubLib.length === 0) {
    return {
      CODE_CFD_MNA: matchFirstSubLib[0].cfds?.join(",") || null,
      ...getRncpRomesFromSDKresponse({ result: { rncp: matchFirstSubLib[0] } }),
      TYPE_RAPPROCHEMENT_MNA: "LIBSPÉCIALITÉ_RNCP",
    };
  }

  if (matchFirstSubLib.length === 1 && restSubLib.length > 0) {
    let subs = [
      {
        sousLibelle: firstSubLib.intitule,
        CODE_CFD_MNA: matchFirstSubLib[0].FORMATION_DIPLOME,
        CODE_RNCP_MNA: "NA",
        CODE_ROMES_MNA: "NA",
        TYPE_RAPPROCHEMENT_MNA: "LIBSPÉCIALITÉ_RNCP",
      },
    ];
    await asyncForEach(restSubLib, async (subLib) => {
      const matchBcn = await Models.FicheRncp.find({
        intitule_diplome: new RegExp(`${subLib.intitule}`),
      }).lean();
      if (matchBcn.length > 0) {
        subs.push({
          sousLibelle: subLib.intitule,
          CODE_CFD_MNA: matchBcn.map((m) => m.cfds?.join(",") || "").join(","),
          CODE_RNCP_MNA: "TODO",
          CODE_ROMES_MNA: "NA",
          TYPE_RAPPROCHEMENT_MNA: "LIBSPÉCIALITÉ_RNCP",
        });
      }
    });
    if (subs.length === 1) {
      return {
        CODE_CFD_MNA: null,
        //...getRncpRomesFromSDKresponse({ result: { rncp: matchFiches[0] } }),
        TYPE_RAPPROCHEMENT_MNA: null,
      };
    }
    return {
      CODE_CFD_MNA: null,
      //...getRncpRomesFromSDKresponse({ result: { rncp: matchFiches[0] } }),
      TYPE_RAPPROCHEMENT_MNA: "LIBSPÉCIALITÉ_RNCP_MULTIPLE",
      TEMP_SUBS: subs,
    };
  }

  return { CODE_CFD_MNA: null, CODE_RNCP_MNA: null, CODE_ROMES_MNA: null, TYPE_RAPPROCHEMENT_MNA: null };
};

const findByIntituleInBcn = async (formationPsRawData) => {
  const [firstSubLib, ...restSubLib] = extractSubLibSpecialite(formationPsRawData["LIBSPÉCIALITÉ"]);

  const matchFirstSubLib = await Models.BcnFormationDiplome.find({
    LIBELLE_LONG_200: new RegExp(`${firstSubLib.intitule.toUpperCase()}`),
  }).lean();

  if (matchFirstSubLib.length === 1 && restSubLib.length === 0) {
    return {
      CODE_CFD_MNA: matchFirstSubLib[0].FORMATION_DIPLOME,
      //...getRncpRomesFromSDKresponse({ result: { rncp: matchFiches[0] } }),
      TYPE_RAPPROCHEMENT_MNA: "LIBSPÉCIALITÉ_CFD",
    };
  }

  if (matchFirstSubLib.length === 1 && restSubLib.length > 0) {
    let subs = [
      {
        sousLibelle: firstSubLib.intitule,
        CODE_CFD_MNA: matchFirstSubLib[0].FORMATION_DIPLOME,
        CODE_RNCP_MNA: "NA",
        CODE_ROMES_MNA: "NA",
        TYPE_RAPPROCHEMENT_MNA: "LIBSPÉCIALITÉ_CFD",
      },
    ];
    await asyncForEach(restSubLib, async (subLib) => {
      const matchBcn = await Models.BcnFormationDiplome.find({
        LIBELLE_LONG_200: new RegExp(`${subLib.intitule.toUpperCase()}`),
      }).lean();
      if (matchBcn.length > 0) {
        subs.push({
          sousLibelle: subLib.intitule,
          CODE_CFD_MNA: matchBcn.map((m) => m.FORMATION_DIPLOME).join(","),
          CODE_RNCP_MNA: "NA",
          CODE_ROMES_MNA: "NA",
          TYPE_RAPPROCHEMENT_MNA: "LIBSPÉCIALITÉ_CFD",
        });
      }
    });
    if (subs.length === 1) {
      return {
        CODE_CFD_MNA: null,
        //...getRncpRomesFromSDKresponse({ result: { rncp: matchFiches[0] } }),
        TYPE_RAPPROCHEMENT_MNA: null,
      };
    }
    return {
      CODE_CFD_MNA: null,
      //...getRncpRomesFromSDKresponse({ result: { rncp: matchFiches[0] } }),
      TYPE_RAPPROCHEMENT_MNA: "LIBSPÉCIALITÉ_BCN_MULTIPLE",
      TEMP_SUBS: subs,
    };
  }

  return { CODE_CFD_MNA: null, CODE_RNCP_MNA: null, CODE_ROMES_MNA: null, TYPE_RAPPROCHEMENT_MNA: null };
};

const createCurrentTable = async (formationsPsRawData) => {
  const currentSpeTable = createWorkingTable(formationsPsRawData);

  // Fetch previous table ps spe from S3
  const filePathTable = path.join(__dirname, "./Table-ParcourSup-spe-latest.xlsx");
  await downloadAndSaveFileFromS3("mna-services/features/ps/Table-ParcourSup-Spécialités-latest.xlsx", filePathTable);
  const previousSpeTableRaw = getJsonFromXlsxFile(filePathTable);

  const previousSpeTable = previousSpeTableRaw.filter((line) => line["CODESPÉCIALITÉ"]);

  // console.log("currentSpeTable", currentSpeTable.length);
  // console.log("previousSpeTable", previousSpeTable.length);

  const uniqTableMap = new Map();
  for (let index = 0; index < previousSpeTable.length; index++) {
    const previous = previousSpeTable[index];
    uniqTableMap.set(JSON.stringify({ code: previous["CODESPÉCIALITÉ"], lib: previous["LIBSPÉCIALITÉ"] }), {
      CODEMEF: null,
      CODE_CFD_MNA: null,
      CODE_RNCP_MNA: null,
      CODE_ROMES_MNA: null,
      TYPE_RAPPROCHEMENT_MNA: null,
      TEMP_SUBS: [],
      ...previous,
    });
  }

  for (let index = 0; index < currentSpeTable.length; index++) {
    const current = currentSpeTable[index];
    // console.log(current);
    if (!uniqTableMap.get(JSON.stringify({ code: current["CODESPÉCIALITÉ"], lib: current["LIBSPÉCIALITÉ"] }))) {
      uniqTableMap.set(JSON.stringify({ code: current["CODESPÉCIALITÉ"], lib: current["LIBSPÉCIALITÉ"] }), current);
    }
  }

  return [...uniqTableMap.values()]; // Merge
};

async function prepare() {
  // Init
  Models = await getModels();

  // Fetch latest psup formation from S3
  const filePath = path.join(__dirname, "./listeFormationApprentissage_latest.xlsx");
  await downloadAndSaveFileFromS3("mna-services/features/ps/listeFormationApprentissage_latest.xlsx", filePath);
  const formationsPsRawData = getJsonFromXlsxFile(filePath);

  // console.log(formationsPsRawData.length);

  const workingTableSpe = await createCurrentTable(formationsPsRawData);
  // console.log(workingTableSpe);
  // console.log(workingTableSpe.length);
  const updatedTableSpe = [];

  let countNotFoundMef = 0;
  let countNotFoundBcn = 0;
  let countNotFoundRNCP = 0;
  await asyncForEach(workingTableSpe, async (spe) => {
    if (spe.TYPE_RAPPROCHEMENT_MNA !== "MANUEL") {
      let dataToComplete = {
        CODE_CFD_MNA: null,
        CODE_RNCP_MNA: null,
        CODE_ROMES_MNA: null,
        TYPE_RAPPROCHEMENT_MNA: null,
      };

      dataToComplete = await findByMef(spe);

      if (!dataToComplete.TYPE_RAPPROCHEMENT_MNA) {
        countNotFoundMef++;
        dataToComplete = await findByIntituleInBcn(spe);
        if (!dataToComplete.TYPE_RAPPROCHEMENT_MNA) {
          countNotFoundBcn++;
          dataToComplete = await findByIntituleInRNCP(spe);
          if (!dataToComplete.TYPE_RAPPROCHEMENT_MNA) {
            countNotFoundRNCP++;
          }
        }
      }

      // Cosmetic
      dataToComplete = {
        ...dataToComplete,
        CODE_CFD_MNA: dataToComplete.CODE_CFD_MNA ?? "Non trouvé",
        CODE_RNCP_MNA: dataToComplete.CODE_RNCP_MNA ?? "Non trouvé",
        CODE_ROMES_MNA: dataToComplete.CODE_ROMES_MNA ?? "Non trouvé",
        TYPE_RAPPROCHEMENT_MNA: dataToComplete.TYPE_RAPPROCHEMENT_MNA ?? "ERREUR",
      };
      updatedTableSpe.push({ ...spe, ...dataToComplete });
    } else {
      updatedTableSpe.push({ ...spe });
    }
  });
  console.log(countNotFoundMef);
  console.log(countNotFoundBcn);
  console.log(countNotFoundRNCP);

  // Complete Missing codes for the ones not in errors
  await asyncForEach(updatedTableSpe, async (spe) => {
    if (
      spe.TYPE_RAPPROCHEMENT_MNA !== "ERREUR" &&
      spe.TYPE_RAPPROCHEMENT_MNA !== "LIBSPÉCIALITÉ_RNCP_MULTIPLE" &&
      spe.TYPE_RAPPROCHEMENT_MNA !== "LIBSPÉCIALITÉ_BCN_MULTIPLE"
    ) {
      if (spe.CODE_CFD_MNA === "Non trouvé" && spe.CODE_RNCP_MNA !== "Non trouvé") {
        const codesRncp = spe.CODE_RNCP_MNA.split(",");
        const codesCfd = [];
        for (let index = 0; index < codesRncp.length; index++) {
          const codeRNCP = codesRncp[index];
          const resultRncp = await getRncpInfo(codeRNCP);
          if (resultRncp && resultRncp.result.cfds && resultRncp.result.cfds.length > 0) {
            codesCfd.push(resultRncp.result.cfds.join(","));
          }
        }
        if (codesCfd.length > 0) spe.CODE_CFD_MNA = codesCfd.join(",");
        // TODO FIX ERRORS if _doc null
      } else if (spe.CODE_CFD_MNA !== "Non trouvé" && spe.CODE_RNCP_MNA === "Non trouvé") {
        const codesCfds = spe.CODE_CFD_MNA.split(",");
        const resRncp = [];
        for (let index = 0; index < codesCfds.length; index++) {
          const codeCfd = codesCfds[index];
          const resultCfd = await getCfdInfo(codeCfd);
          if (resultCfd && resultCfd.result.rncp && resultCfd.result.rncp.code_rncp) {
            resRncp.push(getRncpRomesFromSDKresponse(resultCfd));
          }
        }
        if (resRncp.length > 0) {
          // console.log(resRncp.map(({ CODE_RNCP_MNA }) => CODE_RNCP_MNA).join(","));
          // console.log(resRncp.map(({ CODE_ROMES_MNA }) => CODE_ROMES_MNA).join(","));
          spe.CODE_RNCP_MNA = resRncp.map(({ CODE_RNCP_MNA }) => CODE_RNCP_MNA).join(",");
          spe.CODE_ROMES_MNA = resRncp.map(({ CODE_ROMES_MNA }) => CODE_ROMES_MNA).join(",");
        }
      }
    }
  });

  await generateSpeTableFile(updatedTableSpe);

  //////////////
  const tableToUse = updatedTableSpe.filter((spe) => {
    return (
      spe.TYPE_RAPPROCHEMENT_MNA !== "ERREUR" &&
      spe.TYPE_RAPPROCHEMENT_MNA !== "LIBSPÉCIALITÉ_RNCP_MULTIPLE" &&
      spe.TYPE_RAPPROCHEMENT_MNA !== "LIBSPÉCIALITÉ_BCN_MULTIPLE"
    );
  });
  const formationsPsUpdatedData = [];
  await asyncForEach(formationsPsRawData, async (formationPsRawData) => {
    const found = tableToUse.find(
      (item) =>
        item["CODESPÉCIALITÉ"] === formationPsRawData["CODESPÉCIALITÉ"] &&
        item["LIBSPÉCIALITÉ"] === formationPsRawData["LIBSPÉCIALITÉ"]
    );
    if (found) {
      formationsPsUpdatedData.push({
        ...formationPsRawData,
        CODE_CFD_MNA: found.CODE_CFD_MNA,
        CODE_RNCP_MNA: found.CODE_RNCP_MNA,
        CODE_ROMES_MNA: found.CODE_ROMES_MNA,
        TYPE_RAPPROCHEMENT_MNA: found.TYPE_RAPPROCHEMENT_MNA,
      });
    } else {
      formationsPsUpdatedData.push({
        ...formationPsRawData,
        CODE_CFD_MNA: "",
        CODE_RNCP_MNA: "",
        CODE_ROMES_MNA: "",
        TYPE_RAPPROCHEMENT_MNA: "",
      });
    }
  });

  await createXlsxFromJson(
    formationsPsUpdatedData,
    path.join(__dirname, "/listeFormationApprentissage_latest_COMPLETÉ.xlsx")
  );
  //////////////
  // EOS
}

runScript(async () => {
  await prepare();
});
