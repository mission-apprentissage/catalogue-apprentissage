const logger = require("../../../common/logger");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { getJsonFromXlsxFile } = require("../../../common/utils/fileUtils");
const { AfFormation, ConvertedFormation } = require("../../../common/model");
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

  const dept = `${formation.code_postal_modified.code_postal.substring(0, 2)}`;

  const result = await ConvertedFormation.find({
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

  if (!cfd) return null;

  return cfd;
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
       * - En cas de mef = "AFFECTATION", récupération du cfd dans les données 2020 à partir de la combinaison [code postal + uai + code voie + code spécialité]
       * - sinon depuis les tco / bcn si toujours pas de cfd
       */

      let code_cfd;
      const code_mef = item["Code MEF"]?.trim();
      const code_postal = item["CP"]?.trim();
      const uai = item["UAI"]?.trim();
      const code_voie = item["Code voie"]?.trim();
      const code_specialite = item["Code spécialité"]?.trim();

      if (code_mef === "AFFECTATION") {
        const match = oldData.find(
          ({ code_postal: cp, uai: u, code_voie: cv, code_specialite: cs }) =>
            code_specialite === cs && code_postal === cp && uai === u && code_voie === cv
        );
        code_cfd = match?.code_cfd;
        if (code_cfd) {
          nbFoundAffectation += 1;
        }
      }

      await AfFormation.create({
        // id_mna: item["ID_MNA"],
        code_cfd,
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
        etablissement_type: item["Public / Privé"]?.trim() === "PR" ? "Privée" : "Public",
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
