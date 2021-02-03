const logger = require("../../common/logger");
const path = require("path");
const { getMefInfo } = require("../../common/services/tables_correspondance");

const { PsFormation } = require("../../common/model/index");

const { asyncForEach } = require("../../common/utils/asyncUtils");
const { getJsonFromXlsxFile } = require("../../common/utils/fileUtils");

const { runScript } = require("../scriptWrapper");

const run = async () => {
  try {
    const filePath = path.resolve(__dirname, "./assets/Liste_Formation_Apprentissage_Psup.xlsx");
    const data = getJsonFromXlsxFile(filePath);

    await asyncForEach(data, async (formation) => {
      if (!formation.CODECFD && formation.CODEMEF) {
        const responseMEF = await getMefInfo(formation.code_mef_10);

        if (responseMEF) {
          if (!responseMEF.messages.cfdUpdated === "Non trouvé") {
            formation.code_cfd = responseMEF.result.cfd.cfd;
          }
        }
      }

      logger.info(`Add ${formation.LIB_AFF} — ${formation.CODEMEF} to DB`);

      await PsFormation.create({
        uai_gestionnaire: formation.UAI_GES,
        uai_composante: formation.UAI_COMPOSANTE,
        libelle_uai_composante: formation.LIB_COMPOSANTE,
        uai_affilie: formation.UAI_AFF,
        libelle_uai_affilie: formation.LIB_AFF,
        code_commune_insee: formation.CODECOMMUNE,
        libelle_commune: formation.LIBCOMMUNE,
        code_postal: formation.CODEPOSTAL,
        nom_academie: formation.ACADEMIE,
        code_ministere: formation.MINISTERETUTELLE,
        libelle_ministere: formation.LIBMINISTERE,
        type_etablissement: formation.TYPEETA,
        code_formation: formation.CODEFORMATION,
        libelle_formation: formation.LIBFORMATION,
        code_specialite: formation.CODESPECIALITE,
        libelle_specialite: formation.LIBSPECIALITE,
        code_formation_initiale: formation.CODESPEFORMATIONINITIALE,
        code_mef_10: formation.CODEMEF,
        code_cfd: formation.CODECFD,
        code_cfd_2: formation.CODECFD2,
        code_cfd_3: formation.CODECFD3,
      });
    });
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
