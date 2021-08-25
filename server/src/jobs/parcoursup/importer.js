const path = require("path");
const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const { PsFormation } = require("../../common/model/index");
const { asyncForEach } = require("../../common/utils/asyncUtils");
const { downloadAndSaveFileFromS3 } = require("../../common/utils/awsUtils");
const { getJsonFromXlsxFile } = require("../../common/utils/fileUtils");

const mapping = (formation) => {
  return {
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
    uai_cerfa: formation.UAI_CERFA,
    uai_insert_jeune: formation.UAI_INSERT,
    uai_map: formation.UAI_MAP,
    siret_map: formation.SIRET_MAP,
    siret_cerfa: formation.SIRET_CERFA,
    codediplome_map: formation.CODEDIPLOME_MAP,
    code_formation_inscription: formation.CODEFORMATIONINSCRIPTION,
    code_formation_accueil: formation.CODEFORMATIONACCUEIL,
    latitude: formation.LATITUDE,
    longitude: formation.LONGITUDE,
    complement_adresse: formation.COMPLEMENTADRESSE,
    complement_adresse_1: formation.COMPLEMENTADRESSE1,
    complement_adresse_2: formation.COMPLEMENTADRESSE2,
    complement_code_postal: formation.COMPLEMENTCODEPOSTAL,
    complement_commune: formation.COMPLEMENTCOMMUNE,
    libelle_insert_jeune: formation.LIB_INS,
    complement_cedex: formation.COMPLEMENTCEDEX,
    codes_cfd_mna: formation.CODE_CFD_MNA?.split(",") || [],
    codes_rncp_mna: formation.CODE_RNCP_MNA?.split(",") || [],
    codes_romes_mna: formation.CODE_ROMES_MNA?.split(",") || [],
    type_rapprochement_mna: formation.TYPE_RAPPROCHEMENT_MNA,
  };
};

const run = async () => {
  try {
    const filePath = path.join(__dirname, "./listeFormationApprentissage_generate_latest.xlsx");
    await downloadAndSaveFileFromS3(
      "mna-services/features/ps/listeFormationApprentissage_generate_latest.xlsx",
      filePath
    );
    const data = getJsonFromXlsxFile(filePath);

    let stat = {
      file: data.length,
      inserted: 0,
      updated: 0,
    };

    await asyncForEach(data, async (formation) => {
      const mapped = mapping(formation);
      const exist = await PsFormation.findOne({ id_parcoursup: mapped.id_parcoursup }).lean();

      if (exist) {
        await PsFormation.findOneAndUpdate({ id_parcoursup: mapped.id_parcoursup }, mapped, {
          upsert: true,
          new: true,
        });
        stat.updated += 1;
      } else {
        const psFormation = new PsFormation(mapped);
        await psFormation.save();

        stat.inserted += 1;
      }
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
