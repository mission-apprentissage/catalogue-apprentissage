const path = require("path");
const { runScript } = require("../../scriptWrapper");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
// const { habiliteList } = require("../../../constants/certificateurs");
// const { createXlsxFromJson } = require("../../../common/utils/fileUtils");
const { getCfdInfo, getMef10Info, getBcnInfo } = require("@mission-apprentissage/tco-service-node"); // getRncpInfo
const { getJsonFromXlsxFile } = require("../../../common/utils/fileUtils");
const { downloadAndSaveFileFromS3 } = require("../../../common/utils/awsUtils");

// const isHabiliteRncp = ({ partenaires = [], certificateurs = [] }, siret) => {
//   if ((certificateurs ?? []).some(({ certificateur }) => habiliteList.includes(certificateur))) {
//     return true;
//   }

//   const isPartenaire = (partenaires ?? []).some(
//     ({ Siret_Partenaire, Habilitation_Partenaire }) =>
//       Siret_Partenaire === siret && ["HABILITATION_ORGA_FORM", "HABILITATION_FORMER"].includes(Habilitation_Partenaire)
//   );
//   const isCertificateur = (certificateurs ?? []).some(({ siret_certificateur }) => siret_certificateur === siret);
//   return isPartenaire || isCertificateur;
// };

// const getInfo = async (rncp, siret) => {
//   console.log(rncp, siret);
//   try {
//     let rncpDetails = await getRncpInfo(rncp);
//     let habilitation = await isHabiliteRncp(
//       { partenaires: rncpDetails.result?.partenaires, certificateurs: rncpDetails.result?.certificateurs },
//       siret
//     );

//     return habilitation;
//   } catch (error) {
//     console.log("rncp error", error);

//     return null;
//   }
// };

const parseLibelleLong = (libelle) =>
  libelle
    .split(" - en apprentissage")[0]
    .replace(/\((.)*\)+/g, "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

const parseLibelleCourt = (libelle) => {
  if (libelle.includes("BUT")) return "DUT";
  if (libelle.includes("Formation professionnelle")) return "";
  if (libelle.includes("Formations  des écoles d'ingénieurs")) return "";
  if (libelle.includes("Certificat de Spécialisation Agricole")) return "";
  if (libelle.includes("BPJEPS")) return "";
  if (libelle.includes("Sous-officier")) return "";
};

const extractTablePs = async (formationsPs) => {
  const specialitePsRawData = formationsPs.map((f) => ({
    // eslint-disable-next-line prettier/prettier
    CODESPÉCIALITÉ: f["CODESPÉCIALITÉ"],
    // eslint-disable-next-line prettier/prettier
    LIBSPÉCIALITÉ: f["LIBSPÉCIALITÉ"],
    CODE_CFD_MNA: f.CODE_CFD_MNA,
    CODE_RNCP_MNA: f.CODE_RNCP_MNA,
    CODE_ROMES_MNA: f.CODE_ROMES_MNA,
    TYPE_RAPPROCHEMENT_MNA:
      f.CODE_CFD_MNA === "Non trouvé" || f.CODE_CFD_MNA === "Non trouvé" ? "ERREUR" : f.TYPE_RAPPROCHEMENT_MNA,
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
  // console.log(groupByUniq);
  // await createXlsxFromJson(groupBuUniq, path.join(__dirname, "/table_PS.xlsx"));
};

const getRncpRomesFromSDKresponse = ({ result: { rncp: rncpInfo } }) => ({
  CODE_RNCP_MNA: rncpInfo?.code_rncp ?? null,
  CODE_ROMES_MNA: rncpInfo?.romes ? rncpInfo?.romes.map((x) => x.rome).join() : null,
});

const findByMef = async ({ CODEMEF }) => {
  let result = { CODE_CFD_MNA: null, CODE_RNCP_MNA: null, CODE_ROMES_MNA: null };
  if (!CODEMEF) return result;

  try {
    let responseMEF = await getMef10Info(CODEMEF);
    result = {
      CODE_CFD_MNA: responseMEF.result.cfd?.cfd ?? null,
      ...getRncpRomesFromSDKresponse(responseMEF),
    };

    if (responseMEF.messages.rncp.error === "Erreur: Non trouvé" && responseMEF.messages.cfdUpdated === "Trouvé") {
      let responseCFD = await getCfdInfo(result.CODE_CFD_MNA);

      if (responseCFD) {
        result = {
          CODE_CFD_MNA: result.CODE_CFD_MNA,
          ...getRncpRomesFromSDKresponse(responseCFD),
        };
      }
    }
  } catch (error) {
    console.log("findByMef", error);
  }
  return result;
};

const findByIntituleInBcn = async (formationPsRawData) => {
  let result = { CODE_CFD_MNA: null, CODE_RNCP_MNA: null, CODE_ROMES_MNA: null };

  const libelleLong = parseLibelleLong(formationPsRawData["LIBSPÉCIALITÉ"]);
  const libelleCourt = parseLibelleCourt(formationPsRawData.LIBFORMATION);

  try {
    const {
      formationsDiplomes,
      pagination: { total },
    } = await getBcnInfo({ query: { LIBELLE_LONG_200: libelleLong } });

    if (total > 0) {
      console.log(total);
      const openFormation = formationsDiplomes.filter((x) => x.LIBELLE_COURT === libelleCourt);

      if (openFormation.length > 0) {
        result.CODE_CFD_MNA = openFormation[0].FORMATION_DIPLOME;
      }
    }
  } catch (error) {
    console.log("findByIntituleInBcn", error);
  }

  if (result.CODE_CFD_MNA) {
    try {
      let responseCFD = await getCfdInfo(result.CODE_CFD_MNA);

      if (responseCFD) {
        result = {
          CODE_CFD_MNA: result.CODE_CFD_MNA,
          ...getRncpRomesFromSDKresponse(responseCFD),
        };
      }
    } catch (error) {
      console.log("findByIntituleInBcn", error);
    }
  }
  return result;
};

async function prepare() {
  // Fetch latest psup formation from S3
  const filePath = path.join(__dirname, "./psup_latest.xls");
  await downloadAndSaveFileFromS3("psup_latest.xls", filePath);
  const formationsPsRawData = getJsonFromXlsxFile(filePath);
  const formationsPsUpdated = [];

  console.log(formationsPsRawData.length);

  let countFindByMef = 0;
  let countFindByIntituleInBcn = 0;
  await asyncForEach(formationsPsRawData, async (formationPsRawData) => {
    let dataToComplete = { CODE_CFD_MNA: null, CODE_RNCP_MNA: null, CODE_ROMES_MNA: null };

    dataToComplete = await findByMef(formationPsRawData);

    if (!dataToComplete.CODE_CFD_MNA) {
      countFindByMef++;
      dataToComplete = await findByIntituleInBcn(formationPsRawData);
      if (!dataToComplete.CODE_CFD_MNA) {
        countFindByIntituleInBcn++;
      }
    }

    // Cosmetic
    dataToComplete = {
      CODE_CFD_MNA: dataToComplete.CODE_CFD_MNA ?? "Non trouvé",
      CODE_RNCP_MNA: dataToComplete.CODE_RNCP_MNA ?? "Non trouvé",
      CODE_ROMES_MNA: dataToComplete.CODE_ROMES_MNA ?? "Non trouvé",
    };
    formationsPsUpdated.push({ ...formationPsRawData, ...dataToComplete });
  });
  console.log(countFindByMef);
  console.log(countFindByIntituleInBcn);
  await extractTablePs(formationsPsUpdated);
}

runScript(async () => {
  await prepare();
});
