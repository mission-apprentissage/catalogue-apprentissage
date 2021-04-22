const path = require("path");
const { runScript } = require("../../scriptWrapper");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { createXlsxFromJson } = require("../../../common/utils/fileUtils");
const { getMef10Info, getModels } = require("@mission-apprentissage/tco-service-node");
const { getJsonFromXlsxFile } = require("../../../common/utils/fileUtils");
const { downloadAndSaveFileFromS3 } = require("../../../common/utils/awsUtils");
const { orderBy } = require("lodash");

let Models = null;

const generateFile = async (formationsPs) => {
  const specialitePsRawData = formationsPs.map((f) => ({
    // eslint-disable-next-line prettier/prettier
    CODESPÉCIALITÉ: f["CODESPÉCIALITÉ"],
    // eslint-disable-next-line prettier/prettier
    LIBSPÉCIALITÉ: f["LIBSPÉCIALITÉ"],
    CODEMEF: f.CODEMEF,
    CODE_CFD_MNA: f.CODE_CFD_MNA,
    CODE_RNCP_MNA: f.CODE_RNCP_MNA,
    CODE_ROMES_MNA: f.CODE_ROMES_MNA,
    TYPE_RAPPROCHEMENT_MNA: f.TYPE_RAPPROCHEMENT_MNA,
    TEMP_SUBS: f.TEMP_SUBS || [],
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
  console.log(groupByUniq.length);

  const specialiteOutput = [];
  for (let index = 0; index < groupByUniq.length; index++) {
    const { TEMP_SUBS, ...rest } = groupByUniq[index];
    specialiteOutput.push(rest);
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

  await createXlsxFromJson(specialiteOutput, path.join(__dirname, "/table_PS.xlsx"));

  //TODO PS TAB
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
  // let result = { CODE_CFD_MNA: null, CODE_RNCP_MNA: null, CODE_ROMES_MNA: null, TYPE_RAPPROCHEMENT_MNA: null };

  // const recompose = extractSubLibSpecialite(formationPsRawData["LIBSPÉCIALITÉ"]);

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
  // let result = { CODE_CFD_MNA: null, CODE_RNCP_MNA: null, CODE_ROMES_MNA: null, TYPE_RAPPROCHEMENT_MNA: null };

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

async function prepare() {
  // Fetch latest psup formation from S3
  const filePath = path.join(__dirname, "./psup_latest.xls");
  await downloadAndSaveFileFromS3("psup_latest.xls", filePath);
  const formationsPsRawData = getJsonFromXlsxFile(filePath);
  const formationsPsUpdated = [];
  Models = await getModels();

  console.log(formationsPsRawData.length);

  let countNotFoundMef = 0;
  let countNotFoundBcn = 0;
  let countNotFoundRNCP = 0;
  await asyncForEach(formationsPsRawData, async (formationPsRawData) => {
    let dataToComplete = {
      CODE_CFD_MNA: null,
      CODE_RNCP_MNA: null,
      CODE_ROMES_MNA: null,
      TYPE_RAPPROCHEMENT_MNA: null,
    };

    dataToComplete = await findByMef(formationPsRawData);

    if (!dataToComplete.TYPE_RAPPROCHEMENT_MNA) {
      countNotFoundMef++;
      dataToComplete = await findByIntituleInBcn(formationPsRawData);
      if (!dataToComplete.TYPE_RAPPROCHEMENT_MNA) {
        countNotFoundBcn++;
        dataToComplete = await findByIntituleInRNCP(formationPsRawData);
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
    formationsPsUpdated.push({ ...formationPsRawData, ...dataToComplete });
  });
  console.log(countNotFoundMef);
  console.log(countNotFoundBcn);
  console.log(countNotFoundRNCP);
  await generateFile(formationsPsUpdated);
}

runScript(async () => {
  await prepare();
});
