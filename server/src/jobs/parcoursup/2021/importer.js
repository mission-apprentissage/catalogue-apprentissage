const path = require("path");
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const isValidCFD = require("../../../common/utils/cfdUtils");
const { PsFormation2021 } = require("../../../common/model/index");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { downloadAndSaveFileFromS3 } = require("../../../common/utils/awsUtils");
const { getJsonFromXlsxFile } = require("../../../common/utils/fileUtils");
const { getCfdInfo, getMef10Info } = require("@mission-apprentissage/tco-service-node");

const run = async () => {
  try {
    const filePath = path.join(__dirname, "../assets/psup_latest.xls");
    await downloadAndSaveFileFromS3("psup_latest.xls", filePath);
    const data = getJsonFromXlsxFile(filePath);
    const psup = await PsFormation2021.find({}).lean();

    const newFormation = data.filter((item) => {
      let exist = psup.find((x) => x.id_parcoursup === item.CODEFORMATIONACCUEIL);
      if (!exist) {
        return item;
      }
    });

    if (newFormation.length === 0) {
      logger.info("All formations are already present in the database.");
      return;
    }

    let stat = {
      file: data.length,
      new: newFormation.length,
      inserted: 0,
    };

    await asyncForEach(newFormation, async (formation) => {
      if (formation.CODEMEF) {
        try {
          const responseMEF = await getMef10Info(formation.CODEMEF);

          if (responseMEF) {
            formation.CFD = responseMEF.result?.cfd?.cfd;
          }
        } catch (error) {
          console.log("[ERROR] getMefInfo", error);
        }
      }

      let cfd = formation.CFD
        ? formation.CFD
        : isValidCFD(formation.CODEDIPLOME_MAP)
        ? formation.CODEDIPLOME_MAP
        : null;

      if (!formation.CODEMEF && cfd) {
        try {
          const responseCFD = await getCfdInfo(cfd);
          if (responseCFD) {
            formation.CODEMEF = responseCFD.result?.mefs?.mefs10[0]?.mef10;
          }
        } catch (error) {
          console.log("[ERROR] getCfdInfo", error);
        }
      }

      await PsFormation2021.create({
        id_parcoursup: formation.CODEFORMATIONINSCRIPTION,
        uai_gestionnaire: formation.UAI_GES,
        uai_composante: formation.UAI_COMPOSANTE,
        libelle_uai_composante: formation.LIB_COMPOSANTE,
        uai_affilie: formation.UAI_AFF,
        libelle_uai_affilie: formation.LIB_AFF,
        code_commune_insee: formation.CODECOMMUNE,
        libelle_commune: formation.LIBCOMMUNE,
        code_postal: formation.CODEPOSTAL,
        nom_academie: formation.ACADÉMIE,
        code_ministere: formation.MINISTERETUTELLE,
        libelle_ministere: formation.LIBMINISTERE,
        type_etablissement: formation.TYPEETA,
        code_formation: formation.CODEFORMATION,
        libelle_formation: formation.LIBFORMATION,
        code_specialite: formation.CODESPÉCIALITÉ,
        libelle_specialite: formation.LIBSPÉCIALITÉ,
        code_formation_initiale: formation.CODESPÉFORMATIONINITIALE,
        code_mef_10: formation.CODEMEF,
        code_cfd: formation.CFD || cfd,
        uai_cerfa: formation.UAI_CERFA,
        uai_insert_jeune: formation.UAI_INSERT,
        uai_map: formation.UAI_MAP,
        siret_map: formation.SIRET_MAP,
        siret_cerfa: formation.SIRET_CERFA,
      });

      stat.inserted += 1;
    });
    console.log({ stat });
  } catch (err) {
    logger.error(err);
  }
};

if (process.env.standalone) {
  runScript(async () => {
    logger.info(" -- Start database import -- ");

    await run();

    logger.info(" -- End database import -- ");
  });
}
