const path = require("path");
const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const { asyncForEach } = require("../../common/utils/asyncUtils");
const { getJsonFromXlsxFile } = require("../../common/utils/fileUtils");
const { AfFormation } = require("../../common/model");

const getLibelleCourt = (libelle) => {
  switch (libelle) {
    case "SECONDE PRO BACPRO 3ANS / 1E ANNEE BEP":
      return "BAC PRO";
    case "CAP":
      return "CAP";
    case "1ERE PROFESSIONNELLE":
      return "LIC-PRO";
    case "AUTRES":
      return ""; // to be discretized
    case "REDOUBLEMENT 3EME":
      return "";
    default:
      return "";
  }
};

const seed = async () => {
  const filePath = path.resolve(__dirname, "./assets/affelnet-2020.xlsx");
  const data = getJsonFromXlsxFile(filePath);
  let count = 0;

  logger.info(`${data.length} formations récupéré du fichier excel, début de l'enregistrement...`);

  await asyncForEach(data, async (item) => {
    try {
      await AfFormation.create({
        uai: item["UAI"],
        libelle_type_etablissement: item["Libellé type établissement"],
        libelle_etablissement: item["Libellé établissement"],
        adresse: item["Adresse"],
        code_postal: item["CP"],
        commune: item["Commune"],
        telephone: item["Téléphone"],
        email: item["Mél"],
        academie: item["Académie"],
        ministere: item["Ministère"],
        etablissement_type: item["Public / Privé"] === "PR" ? "Privée" : "Public",
        type_contrat: item["Type contrat"],
        code_type_etablissement: item["Code type établissement"],
        code_nature: item["Code nature"],
        code_district: item["Code district"],
        code_bassin: item["Code bassin"],
        cio: item["CIO"],
        internat: item["Internat"] === "O" ? true : false,
        reseau_ambition_reussite: item["Réseau ambition réussite"] === "O" ? true : false,
        libelle_mnemonique: item["Mnémonique"],
        code_specialite: item["Code spécialité"],
        libelle_ban: item["Libellé BAN"],
        code_mef: item["Code MEF"],
        code_voie: item["Code voie"],
        type_voie: item["Libellé voie"],
        saisie_possible_3eme: item["Saisie possible 3me ?"] === "O" ? true : false,
        saisie_reservee_segpa: item["Saisie réservée SEGPA ?"] === "O" ? true : false,
        saisie_possible_2nde: item["Saisie possible 2de ?"] === "O" ? true : false,
        visible_tsa: item["Visible TSA ?"] === "O" ? true : false,
        libelle_formation: item["Libéllé formation"],
        url_onisep_formation: item["URL ONISEP formation"],
        libelle_etablissement_tsa: item["Libellé établissement_1"],
        url_onisep_etablissement: item["URL ONISEP établissement"],
        ville: item["Libellé ville"],
        campus_metier: item["Campus métier ?"] === "O" ? true : false,
        modalites: item["Modalités particulières ?"] === "O" ? true : false,
        coordonnees_gps_latitude: item["Coordonnées GPS latitude"],
        coordonnees_gps_longitude: item["Coordonnées GPS longitude"],
      });

      count = count + 1;
    } catch (error) {
      logger.error(error);
    }
  });

  logger.info(`${count} formations importées !`);
};

const update = async (tableCorrespondance) => {
  logger.info("Mise à jour des codes formation diplôme");
  const data = await AfFormation.find({});
  logger.info(`${data.length} formations à traiter...`);

  let count;

  await asyncForEach(data, async (item) => {
    let LIBELLE_COURT = getLibelleCourt(item.type_voie);
    let LIBELLE_STAT_33 = item.libelle_ban.substring(item.libelle_ban.indexOf(" ") + 1).trimStart();

    let code_cfd;

    logger.info(`get BCN information ${LIBELLE_STAT_33} - ${LIBELLE_COURT}`);
    const {
      formationsDiplomes,
      pagination: { total },
    } = await tableCorrespondance.getBcnInfo({ query: { LIBELLE_STAT_33, LIBELLE_COURT } });

    if (total === 0) return;

    if (total > 1) {
      const openFormation = formationsDiplomes.filter((x) => x.DATE_FERMETURE === "");
      code_cfd = openFormation[0].FORMATION_DIPLOME;
    }

    code_cfd = formationsDiplomes[0].FORMATION_DIPLOME;

    logger.info(`updating ${item._id} - ${code_cfd}`);
    await AfFormation.findByIdAndUpdate(item._id, { code_cfd });

    count++;
  });
  logger.info(`updated ${count} CFD `);
};

if (process.env.standalone) {
  runScript(async ({ tableCorrespondance }) => {
    logger.info(`Start affelnet import`);

    if ((await AfFormation.countDocuments({})) == 0) {
      await seed();
    }
    await update(tableCorrespondance);

    logger.info(`End affelnet import`);
  });
}
