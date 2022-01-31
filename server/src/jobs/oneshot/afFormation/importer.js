const logger = require("../../../common/logger");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { getJsonFromXlsxFile } = require("../../../common/utils/fileUtils");
const { AfFormation, Formation } = require("../../../common/model");
const { isFinite } = require("lodash");
const stringSimilarity = require("string-similarity");
const { getCpInfo, getMef10Info, getBcnInfo } = require("@mission-apprentissage/tco-service-node");

const { oleoduc, writeData } = require("oleoduc");

const FILE_PATH = "/data/uploads/affelnet-import.xlsx";

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

const getCfdFromTCO = async (mef) => {
  const responseMEF = await getMef10Info(mef);

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

const getCfdFromBCN = async (libelle, type) => {
  let LIBELLE_COURT = getLibelleCourt(type);
  let LIBELLE_STAT_33 = getLibelleLong(libelle);

  logger.info(`BCN "${LIBELLE_STAT_33}" (${LIBELLE_COURT})`);

  const {
    formationsDiplomes,
    pagination: { total },
  } = await getBcnInfo({ query: { LIBELLE_STAT_33, LIBELLE_COURT } });

  if (total === 0) {
    const {
      formationsDiplomes,
      pagination: { total },
    } = await getBcnInfo({ query: { LIBELLE_STAT_33 } });

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

const getCfdFromCatalogue = async (formation) => {
  const data = await getCpInfo(formation.code_postal);
  let cfd;

  if (
    data.messages?.cp === "Ok" ||
    data.messages?.cp === `Update: Le code ${formation.code_postal} est un code commune insee`
  ) {
    formation.code_postal_modified = { ...data.result };
  } else {
    formation.code_postal_modified = { code_postal: formation.code_postal };
  }

  if (formation.cle_ministere_educatif) {
    const result = await Formation.findOne({ cle_ministere_educatif: formation.cle_ministere_educatif }).lean();
    return result.cfd ?? null;
  }

  const dept = `${formation.code_postal_modified.code_postal.substring(0, 2)}`;

  const result = await Formation.find({
    num_departement: dept,
    $and: [
      {
        $or: [
          { etablissement_gestionnaire_code_postal: formation.code_postal_modified.code_postal },
          { etablissement_responsable_code_postal: formation.code_postal_modified.code_postal },
          { code_postal: formation.code_postal_modified.code_postal },
        ],
      },
    ],
  });

  if (result.length === 0) return null;

  let labels = result.map((x) => x.intitule_court);
  let similarities = stringSimilarity.findBestMatch(getLibelleLong(formation.libelle_ban), labels);

  if (similarities.bestMatch.rating > 0.5) {
    console.log("similarities", similarities.bestMatch);
    let { target } = similarities.bestMatch;
    let formationCatalogue = result.filter((x) => x.intitule_court === target);

    cfd = formationCatalogue[0].cfd;
  }

  return cfd ?? null;
};

const seed = async () => {
  const data = getJsonFromXlsxFile(FILE_PATH);
  let count = 0;

  logger.info(`${data.length} formations récupérées du fichier excel, début de l'enregistrement...`);

  const oldData = await AfFormation.find(
    {},
    { code_mef: 1, code_cfd: 1, code_postal: 1, uai: 1, code_voie: 1, code_specialite: 1 }
  ).lean();

  await AfFormation.deleteMany({});

  let nbFoundAffectation = 0;

  await asyncForEach(data, async (item) => {
    try {
      /*
       * - En cas de mef = "AFFECTATION", récupération du cfd dans les données précédentes à partir de la cle_ministere_educatif ou de la combinaison [code postal + uai + code voie + code spécialité]
       * - sinon depuis les tco / bcn si toujours pas de cfd
       */

      let code_cfd;
      const code_mef = item["CODE_MEF"]?.trim();
      const code_postal = item["CP"]?.trim();
      const uai = item["UAI"]?.trim();
      const code_voie = item["CODE_VOIE"]?.trim();
      const code_specialite = item["CODE_SPECIALITE"]?.trim();
      const cle_ministere_educatif = item["CLE_MINISTERE_EDUCATIF"]?.trim();

      if (code_mef === "AFFECTATION") {
        let match;
        if (cle_ministere_educatif) {
          match = oldData.find(({ cle_ministere_educatif: cle }) => cle_ministere_educatif === cle);
        }
        if (!match) {
          match = oldData.find(
            ({ code_postal: cp, uai: u, code_voie: cv, code_specialite: cs }) =>
              code_specialite === cs && code_postal === cp && uai === u && code_voie === cv
          );
        }
        code_cfd = match?.code_cfd;
        if (code_cfd) {
          nbFoundAffectation += 1;
        }
      }

      await AfFormation.create({
        cle_ministere_educatif,
        code_cfd,
        uai,
        libelle_type_etablissement: item["LIBELLE_TYPE_ETABLISSEMENT"]?.trim(),
        libelle_etablissement: item["LIBELLE_ETABLISSEMENT"]?.trim(),
        adresse: item["ADRESSE"]?.trim(),
        code_postal,
        commune: item["COMMUNE"]?.trim(),
        telephone: item["TELEPHONE"]?.trim(),
        email: item["MEL"]?.trim(),
        academie: item["ACADEMIE"]?.trim(),
        ministere: item["MINISTERE"]?.trim(),
        etablissement_type: item["PUBLIC_PRIVE"]?.trim() === "PR" ? "Privée" : "Public",
        type_contrat: item["TYPE_CONTRAT"]?.trim(),
        code_type_etablissement: item["CODE_TYPE_ETABLISSEMENT"]?.trim(),
        code_nature: item["CODE_NATURE"]?.trim(),
        code_district: item["CODE_DISTRICT"]?.trim(),
        code_bassin: item["CODE_BASSIN"]?.trim(),
        cio: item["CIO"]?.trim(),
        internat: item["INTERNAT"] === "O",
        reseau_ambition_reussite: item["RESEAU_AMBITION_REUSSITE"] === "O",
        libelle_mnemonique: item["MNEMONIQUE"]?.trim(),
        code_specialite,
        libelle_ban: item["LIBELLE_BAN"]?.trim(),
        code_mef,
        code_voie,
        type_voie: item["LIBELLE_VOIE"]?.trim(),
        saisie_possible_3eme: item["SAISIE_POSSIBLE_3EME"] === "O",
        saisie_reservee_segpa: item["SAISIE_RESREVEE_SEGPA"] === "O",
        saisie_possible_2nde: item["SAISIE_POSSIBLE_2DE"] === "O",
        visible_tsa: item["VISIBLE_PORTAIL"] === "O",
        libelle_formation: item["LIBELLE_FORMATION"]?.trim(),
        url_onisep_formation: item["URL_ONISEP_FORMATION"]?.trim(),
        libelle_etablissement_tsa: item["LIBELLE_ETABLISSEMENT"]?.trim(),
        url_onisep_etablissement: item["URL_ONISEP_ETABLISSEMENT"]?.trim(),
        ville: item["LIBELLE_VILLE"]?.trim(),
        campus_metier: item["CAMPUS_METIER"] === "O",
        modalites: item["MODALITES_PARTICULIERES"] === "O",
        coordonnees_gps_latitude: item["COORDONNEES_GPS_LATITUDE"]?.trim(),
        coordonnees_gps_longitude: item["COORDONNEES_GPS_LONGITUDE"]?.trim(),
      });

      count = count + 1;
    } catch (error) {
      logger.error(error);
    }
  });
  logger.info(`${nbFoundAffectation} formations trouvées sur AFFECTATION !`);

  logger.info(`${count} formations importées !`);
};

const update_oleoduc = async () => {
  let count = 0;

  await oleoduc(
    AfFormation.find({ libelle_ban: { $ne: null }, code_cfd: { $eq: null } })
      .lean()
      .cursor(),
    writeData(async (formation) => {
      const mef10 = formation.code_mef.slice(0, -1);
      const isValid = isFinite(parseInt(mef10));

      let code_cfd;

      if (isValid) {
        const cfdFromTCO = await getCfdFromTCO(mef10);

        if (cfdFromTCO) {
          code_cfd = cfdFromTCO;
        }
      } else {
        const cfdFromCatalogue = await getCfdFromCatalogue(formation);

        if (cfdFromCatalogue) {
          code_cfd = cfdFromCatalogue;
        } else {
          const cfdFromBCN = await getCfdFromBCN(formation.libelle_ban, formation.type_voie);

          if (cfdFromBCN) {
            code_cfd = cfdFromBCN;
          }
        }
      }

      if (!code_cfd) return;

      logger.info(`MAJ formation ${formation._id} - cfd : ${code_cfd}`);
      await AfFormation.findByIdAndUpdate(formation._id, { code_cfd });

      count++;
    })
  );

  logger.info(`${count} formations mise à jours `);
};

const update = async () => {
  const formations = await AfFormation.find({ libelle_ban: { $ne: null }, code_cfd: { $eq: null } });
  logger.info(`${formations.length} formations à traiter...`);

  let count = 0;

  await asyncForEach(formations, async (formation) => {
    const mef10 = formation.code_mef.slice(0, -1);
    const isValid = isFinite(parseInt(mef10));

    let code_cfd;

    if (isValid) {
      const cfdFromTCO = await getCfdFromTCO(mef10);

      if (cfdFromTCO) {
        code_cfd = cfdFromTCO;
      }
    } else {
      const cfdFromCatalogue = await getCfdFromCatalogue(formation);

      if (cfdFromCatalogue) {
        code_cfd = cfdFromCatalogue;
      } else {
        const cfdFromBCN = await getCfdFromBCN(formation.libelle_ban, formation.type_voie);

        if (cfdFromBCN) {
          code_cfd = cfdFromBCN;
        }
      }
    }

    if (!code_cfd) return;

    logger.info(`MAJ formation ${formation._id} - cfd : ${code_cfd}`);
    await AfFormation.findByIdAndUpdate(formation._id, { code_cfd });

    count++;
  });
  logger.info(`${count} formations mise à jours `);
};

module.exports = { seed, update, update_oleoduc };
