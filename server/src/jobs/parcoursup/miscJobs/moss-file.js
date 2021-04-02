const path = require("path");
const { runScript } = require("../../scriptWrapper");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { habiliteList } = require("../../../constants/certificateurs");
const { createXlsxFromJson } = require("../../../common/utils/fileUtils");
const { getRncpInfo } = require("@mission-apprentissage/tco-service-node");
const { getJsonFromXlsxFile } = require("../../../common/utils/fileUtils");
const { downloadAndSaveFileFromS3 } = require("../../../common/utils/awsUtils");

const isHabiliteRncp = ({ partenaires = [], certificateurs = [] }, siret) => {
  if ((certificateurs ?? []).some(({ certificateur }) => habiliteList.includes(certificateur))) {
    return true;
  }

  const isPartenaire = (partenaires ?? []).some(
    ({ Siret_Partenaire, Habilitation_Partenaire }) =>
      Siret_Partenaire === siret && ["HABILITATION_ORGA_FORM", "HABILITATION_FORMER"].includes(Habilitation_Partenaire)
  );
  const isCertificateur = (certificateurs ?? []).some(({ siret_certificateur }) => siret_certificateur === siret);
  return isPartenaire || isCertificateur;
};

const getInfo = async (rncp, siret) => {
  console.log(rncp, siret);
  try {
    let rncpDetails = await getRncpInfo(rncp);
    let habilitation = await isHabiliteRncp(
      { partenaires: rncpDetails.result?.partenaires, certificateurs: rncpDetails.result?.certificateurs },
      siret
    );

    return habilitation;
  } catch (error) {
    console.log("rncp error", error);

    return null;
  }
};

async function fn() {
  // Fetch latest psup formation from S3
  const filePath = path.join(__dirname, "./psup_latest.xls");
  await downloadAndSaveFileFromS3("psup_latest.xls", filePath);
  const formationData = getJsonFromXlsxFile(filePath);

  // Local file
  // const formationFile = path.resolve(
  //   "/Users/kevbarns/Documents/_PROJETS/beta/catalogue-apprentissage/server/src/jobs/parcoursup/assets/formation-psup-2021_24032021.xls"
  // );
  // const formationData = getJsonFromXlsxFile(formationFile);

  const rncpFile = path.resolve(__dirname, "./psup_rncp.xlsx");
  const rncpData = getJsonFromXlsxFile(rncpFile);

  const formationFiltered = formationData.filter((x) => x.LIBFORMATION === "Formation professionnelle");

  let stat = {
    psup2021: formationData.length,
    fichier_rncp: rncpData.length,
    formation_pro: formationFiltered.length,
    formation_found: 0,
  };

  let result = [];

  await asyncForEach(formationFiltered, async (item) => {
    let exist = rncpData.find((r) => r["Lib Spécialité PS"]?.trim() === item["LIBSPÉCIALITÉ"]?.trim());

    if (exist) {
      stat.formation_found += 1;
      if (exist.RNCP_1) {
        let habilitation = await getInfo(exist.RNCP_1, item.SIRET_CERFA);

        item.RNCP_1 = exist.RNCP_1;
        item.CERTIFICATEUR_1 = exist.Certificateur_1;
        item.HABILITATION_1 = habilitation === true ? "OUI" : "NON";
      }

      if (exist.RNCP_2) {
        let habilitation = await getInfo(exist.RNCP_2, item.SIRET_CERFA);

        item.RNCP_2 = exist.RNCP_2;
        item.CERTIFICATEUR_2 = exist.Certificateur_2;
        item.HABILITATION_2 = habilitation === true ? "OUI" : "NON";
      }
      if (exist.RNCP_3) {
        let habilitation = await getInfo(exist.RNCP_3, item.SIRET_CERFA);

        item.RNCP_3 = exist.RNCP_3;
        item.CERTIFICATEUR_3 = exist.Certificateur_3;
        item.HABILITATION_3 = habilitation === true ? "OUI" : "NON";
      }
      if (exist.RNCP_4) {
        let habilitation = await getInfo(exist.RNCP_4, item.SIRET_CERFA);

        item.RNCP_4 = exist.RNCP_4;
        item.CERTIFICATEUR_4 = exist.Certificateur_4;
        item.HABILITATION_4 = habilitation === true ? "OUI" : "NON";
      }
    }

    result.push(item);
  });

  console.log({ stat });

  await createXlsxFromJson(result, path.join(__dirname, "/habilitation-rncp-titre-pro.xlsx"));
}

runScript(async () => {
  await fn();
});
