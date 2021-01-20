const path = require("path");
const logger = require("../../../common/logger");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { getJsonFromXlsxFile } = require("../../../common/utils/fileUtils");
const { AfFormation } = require("../../../common/model");
const { isFinite } = require("lodash");

const getLibelleCourt = (libelle) => {
  switch (libelle) {
    case "SECONDE PRO BACPRO 3ANS / 1E ANNEE BEP":
      return "BAC PRO";
    case "CAP":
      return "CAP";
    case "1ERE PROFESSIONNELLE":
      return "LIC-PRO";
    default:
      return "";
  }
};

const getCfdFromTCO = async (tableCorrespondance, mef) => {
  const responseMEF = await tableCorrespondance.getMefInfo(mef);

  if (responseMEF) {
    if (responseMEF.messages.cfdUpdated === "Trouvé") {
      return responseMEF.result.cfd.cfd;
    }
  }

  return null;
};

const getLibelleLong = (libelle) => {
  const clean = libelle
    .split(" ")
    .filter((e) => e)
    .join(" ");

  if (clean.includes("2NDE PRO")) {
    return clean.match(/(?<=(2NDE PRO)\s).*/) ? clean.match(/(?<=(2NDE PRO)\s).*/)[0] : clean;
  }
  if (clean.includes("2PROA")) {
    return clean.match(/(?<=(2PROA)\s).*/) ? clean.match(/(?<=(2PROA)\s).*/)[0] : clean;
  }
  if (clean.includes("2DPROA")) {
    return clean.match(/(?<=(2DPROA)\s).*/) ? clean.match(/(?<=(2DPROA)\s).*/)[0] : clean;
  }
  if (clean.includes("2NDPRO")) {
    return clean.match(/(?<=(2NDPRO)\s).*/) ? clean.match(/(?<=(2NDPRO)\s).*/)[0] : clean;
  }
  if (clean.includes("(APPR)")) {
    return clean.match(/(?<=(\(APPR)\)\s).*/) ? clean.match(/(?<=(\(APPR)\)\s).*/)[0] : clean;
  }
  if (clean.includes("1CAP2A")) {
    return clean.match(/(?<=(1CAP2A)\s).*/) ? clean.match(/(?<=(1CAP2A)\s).*/)[0] : clean;
  }
  if (clean.includes("1CAP2")) {
    return clean.match(/(?<=(1CAP2)\s).*/) ? clean.match(/(?<=(1CAP2)\s).*/)[0] : clean;
  }

  return clean.match(/(?<=\s).*/) ? clean.match(/(?<=\s).*/)[0] : clean;
};

const getCfdFromBCN = async (tableCorrespondance, libelle, type) => {
  let LIBELLE_COURT = getLibelleCourt(type);
  let LIBELLE_STAT_33 = getLibelleLong(libelle);

  logger.info(`BCN "${LIBELLE_STAT_33}" (${LIBELLE_COURT})`);

  const {
    formationsDiplomes,
    pagination: { total },
  } = await tableCorrespondance.getBcnInfo({ query: { LIBELLE_STAT_33, LIBELLE_COURT } });

  if (total === 0) {
    const {
      formationsDiplomes,
      pagination: { total },
    } = await tableCorrespondance.getBcnInfo({ query: { LIBELLE_STAT_33 } });

    if (total === 0) return null;

    if (total > 1) {
      const openFormation = formationsDiplomes.filter((x) => x.DATE_FERMETURE === "");
      if (openFormation.length === 0) return null;
      return openFormation[0].FORMATION_DIPLOME;
    }

    return formationsDiplomes[0].FORMATION_DIPLOME;
  }

  if (total > 1) {
    const openFormation = formationsDiplomes.filter((x) => x.DATE_FERMETURE === "");
    if (openFormation.length === 0) return null;
    return openFormation[0].FORMATION_DIPLOME;
  }

  return formationsDiplomes[0].FORMATION_DIPLOME;
};

const seed = async () => {
  const filePath = path.resolve(__dirname, "./assets/affelnet-2020.xlsx");
  const data = getJsonFromXlsxFile(filePath);
  let count = 0;

  logger.info(`${data.length} formations récupéré du fichier excel, début de l'enregistrement...`);

  await asyncForEach(data, async (item) => {
    try {
      await AfFormation.create({
        uai: item["UAI"]?.trim(),
        libelle_type_etablissement: item["Libellé type établissement"]?.trim(),
        libelle_etablissement: item["Libellé établissement"]?.trim(),
        adresse: item["Adresse"]?.trim(),
        code_postal: item["CP"]?.trim(),
        commune: item["Commune"]?.trim(),
        telephone: item["Téléphone"]?.trim(),
        email: item["Mél"]?.trim(),
        academie: item["Académie"]?.trim(),
        ministere: item["Ministère"]?.trim(),
        etablissement_type: item["Public / Privé"] === "PR" ? "Privée" : "Public"?.trim(),
        type_contrat: item["Type contrat"]?.trim(),
        code_type_etablissement: item["Code type établissement"]?.trim(),
        code_nature: item["Code nature"]?.trim(),
        code_district: item["Code district"]?.trim(),
        code_bassin: item["Code bassin"]?.trim(),
        cio: item["CIO"]?.trim(),
        internat: item["Internat"] === "O" ? true : false,
        reseau_ambition_reussite: item["Réseau ambition réussite"] === "O" ? true : false,
        libelle_mnemonique: item["Mnémonique"]?.trim(),
        code_specialite: item["Code spécialité"]?.trim(),
        libelle_ban: item["Libellé BAN"]?.trim(),
        code_mef: item["Code MEF"]?.trim(),
        code_voie: item["Code voie"]?.trim(),
        type_voie: item["Libellé voie"]?.trim(),
        saisie_possible_3eme: item["Saisie possible 3me ?"] === "O" ? true : false,
        saisie_reservee_segpa: item["Saisie réservée SEGPA ?"] === "O" ? true : false,
        saisie_possible_2nde: item["Saisie possible 2de ?"] === "O" ? true : false,
        visible_tsa: item["Visible TSA ?"] === "O" ? true : false,
        libelle_formation: item["Libéllé formation"]?.trim(),
        url_onisep_formation: item["URL ONISEP formation"]?.trim(),
        libelle_etablissement_tsa: item["Libellé établissement_1"]?.trim(),
        url_onisep_etablissement: item["URL ONISEP établissement"]?.trim(),
        ville: item["Libellé ville"]?.trim(),
        campus_metier: item["Campus métier ?"] === "O" ? true : false,
        modalites: item["Modalités particulières ?"] === "O" ? true : false,
        coordonnees_gps_latitude: item["Coordonnées GPS latitude"]?.trim(),
        coordonnees_gps_longitude: item["Coordonnées GPS longitude"]?.trim(),
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
  const data = await AfFormation.find({ libelle_ban: { $ne: null }, code_cfd: { $eq: null } });
  logger.info(`${data.length} formations à traiter...`);

  let count = 0;

  await asyncForEach(data, async (item) => {
    const mef10 = item.code_mef.slice(0, -1);
    const isValid = isFinite(parseInt(mef10));

    let code_cfd;

    if (isValid) {
      const cfdFromTCO = await getCfdFromTCO(tableCorrespondance, mef10);
      if (cfdFromTCO) {
        code_cfd = cfdFromTCO;
      }
    } else {
      const cfdFromBCN = await getCfdFromBCN(tableCorrespondance, item.libelle_ban, item.type_voie);
      if (cfdFromBCN) {
        code_cfd = cfdFromBCN;
      }
    }

    logger.info(`MAJ formation ${item._id} - cfd : ${code_cfd}`);
    await AfFormation.findByIdAndUpdate(item._id, { code_cfd });

    count++;
  });
  logger.info(`${count} formations mise à jours `);
};

module.exports = { seed, update };
