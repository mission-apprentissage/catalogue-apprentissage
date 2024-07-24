// @ts-check

/** @typedef {import("../models/schema/formation").Formation} Formation */
/** @typedef {("affelnet"|"parcoursup")} Plateforme */
/** @typedef {("3 (CAP...)"|"4 (BAC...)"|"5 (BTS, DEUST...)"|"6 (Licence, BUT...)"|"7 (Master, titre ingénieur...)")} Niveau */

/**
 * @param {Object} obj
 * @returns {string}
 */
const serialize = (obj) => {
  return JSON.stringify(obj, (key, value) => {
    if (key === "$regex") {
      return value.source;
    }
    return value;
  });
};

/**
 * @param {string} str
 * @returns {Object}
 */
const deserialize = (str) => {
  return JSON.parse(str, (key, value) => {
    if (key === "$regex") {
      return new RegExp(value);
    }
    return value;
  });
};

const getCampagneStartDate = (currentDate = new Date()) => {
  const campagneStart = new Date(`${currentDate.getFullYear()}-09-18T00:00:00.000Z`);

  return campagneStart;
};

/**
 * Pour appliquer les étiquettes pour les plateformes PS & Affelnet
 * une formation doit avoir au moins une date de début de formation >= début août de l'année scolaire suivante
 * eg: si on est en janvier 2022 --> [01 août 2022] - 31 juillet 2023, si on est en octobre 2022 --> [01 août 2023] - 31 juillet 2024, etc.
 * Si ce n'est pas le cas la formation sera "non publiable en l'état".
 *
 * @param {Date} [currentDate]
 * @returns {Date}
 */
const getSessionStartDate = (currentDate = new Date()) => {
  let durationShift = 0;
  const now = currentDate;
  const sessionStart = getCampagneStartDate(currentDate);

  if (now.getTime() >= sessionStart.getTime()) {
    durationShift = 1;
  }

  const startDate = new Date(`${currentDate.getFullYear() + durationShift}-08-01T00:00:00.000Z`);
  // console.error({ now, sessionStart, startDate });
  return startDate;
};

/**
 * Pour appliquer les étiquettes pour les plateformes PS & Affelnet
 * une formation doit avoir au moins une date de début de formation < fin juillet de l'année scolaire suivante
 * eg: si on est en janvier 2022 --> 01 août 2022 - [juillet 2023], si on est en octobre 2022 --> 01 août 2023 - [31 juillet 2024], etc.
 * Si ce n'est pas le cas la formation sera "non publiable en l'état".
 *
 * @param {Date} [currentDate]
 * @returns {Date}
 */
const getSessionEndDate = (currentDate = new Date()) => {
  let durationShift = 0;
  const now = currentDate;
  const sessionStart = getCampagneStartDate(currentDate);

  if (now.getTime() >= sessionStart.getTime()) {
    durationShift = 1;
  }

  const endDate = new Date(`${currentDate.getFullYear() + 1 + durationShift}-07-31T23:59:59.999Z`);

  return endDate;
};

/**
 * Renvoi l'information permettant de savoir si la formation possède au moins une date de début sur la session en cours
 *
 * @param {Formation} formation
 * @returns {boolean}
 */
const isInSession = ({ date_debut } = { date_debut: [] }) => {
  const startDate = getSessionStartDate();
  const endDate = getSessionEndDate();

  const datesInCampagne = date_debut?.filter(
    (date) => new Date(date).getTime() >= startDate.getTime() && new Date(date).getTime() <= endDate.getTime()
  );
  const result = datesInCampagne?.length > 0;

  return result;
};

/**
 * Renvoi l'information permettant de savoir si la formation possède au moins une date de début sur la session en cours
 *
 * @param {Formation} formation
 * @returns {boolean}
 */
const isInPreviousSession = ({ date_debut } = { date_debut: [] }) => {
  const startDate = getSessionStartDate();
  const endDate = getSessionEndDate();

  startDate.setFullYear(startDate.getFullYear() - 1);
  endDate.setFullYear(endDate.getFullYear() - 1);

  const datesInCampagne = date_debut?.filter(
    (date) => new Date(date).getTime() >= startDate.getTime() && new Date(date).getTime() <= endDate.getTime()
  );
  const result = datesInCampagne?.length > 0;

  return result;
};

/**
 * Obtient la règle permettant de vérifier si la formation possède au moins une date de début sur la session en cours
 *
 */
const getSessionDateRules = (currentDate = new Date()) => ({
  date_debut: { $gte: getSessionStartDate(currentDate), $lt: getSessionEndDate(currentDate) },
});

/**
 * Obtient la règle permettant de vérifier si la formation possède au moins une date de début sur la session précédente
 *
 */
const getPreviousSessionDateRules = (currentDate = new Date()) => {
  const date = currentDate;

  date.setFullYear(date.getFullYear() - 1);

  return {
    date_debut: {
      $gte: getSessionStartDate(date),
      $lt: getSessionEndDate(date),
    },
  };
};

const commonRules = {
  $or: [
    {
      "rncp_details.code_type_certif": {
        $in: ["Titre", "TP", null],
      },
      rncp_code: { $exists: true, $ne: null },
      "rncp_details.rncp_outdated": false,
    },
    {
      "rncp_details.code_type_certif": {
        $in: ["Titre", "TP", null],
      },
      rncp_code: { $eq: null },
      cfd_outdated: false,
    },
    {
      "rncp_details.code_type_certif": {
        $nin: ["Titre", "TP", null],
      },
      cfd_outdated: false,
    },
  ],
  // published: true,
  // etablissement_gestionnaire_catalogue_published: true, // ensure gestionnaire is Qualiopi certified
  // periode: { $gte: getPeriodeStartDate() },
};

const toBePublishedRulesParcousup = {
  $and: [
    {
      ...commonRules,
      annee: { $in: ["1", "9", "X"] },
    },
  ],
};

const toBePublishedRulesAffelnet = {
  $and: [
    {
      ...commonRules,
      annee: { $ne: "X" },
    },
  ],
};

/**
 * @param {Plateforme} plateforme
 */
const getPublishedRules = (plateforme, onlyCataloguePublished = true) => {
  switch (plateforme) {
    case "affelnet":
      return { ...toBePublishedRulesAffelnet, ...(onlyCataloguePublished ? { catalogue_published: true } : {}) };

    case "parcoursup":
      return { ...toBePublishedRulesParcousup, ...(onlyCataloguePublished ? { catalogue_published: true } : {}) };

    default:
      throw new Error(`Invalid plateforme : ${plateforme}`);
  }
};

/**
 * Renvoie la date d'expiration autorisée pour validité d'enregistrement des codes cfd et rncp
 *
 * Update du 17/01/2022
 * Suite aux discussions avec Christine Bourdin et Rachel Bourdon,
 * la règle est d'envoyer les formations aux plateformes pour le cfd ou le rncp qui n'expire pas :
 * du 01/10/N au 31/08/N+1
 */
const getExpirationDate = (currentDate = new Date()) => {
  let durationShift = 1;
  const now = currentDate;
  const sessionStart = new Date(`${currentDate.getFullYear()}-10-01T00:00:00.000Z`);
  if (now >= sessionStart) {
    durationShift = 0;
  }

  return new Date(`${currentDate.getFullYear() + 1 - durationShift}-08-31T23:59:59.999Z`);
};

const getExpireRule = (currentDate = new Date()) => {
  const thresholdDate = getExpirationDate(currentDate);

  return {
    $or: [
      {
        "rncp_details.code_type_certif": {
          $in: ["Titre", "TP", null],
        },
        rncp_code: { $exists: true, $ne: null },
        $or: [
          {
            "rncp_details.date_fin_validite_enregistrement": {
              $gt: thresholdDate,
            },
          },
          { "rncp_details.date_fin_validite_enregistrement": null },
        ],
      },
      {
        "rncp_details.code_type_certif": {
          $in: ["Titre", "TP", null],
        },
        rncp_code: { $eq: null },
        $or: [
          {
            cfd_date_fermeture: {
              $gt: thresholdDate,
            },
          },
          { cfd_date_fermeture: null },
        ],
      },
      {
        "rncp_details.code_type_certif": {
          $nin: ["Titre", "TP", null],
        },
        $or: [
          {
            cfd_date_fermeture: {
              $gt: thresholdDate,
            },
          },
          { cfd_date_fermeture: null },
        ],
      },
    ],
  };
};

// if code_type_certif is "Titre" or "TP" check RNCP sheet is ACTIVE, else no need to check
const titresRule = {
  $and: [
    {
      $or: [
        {
          "rncp_details.code_type_certif": {
            $in: ["Titre", "TP", null],
          },
          rncp_code: { $exists: true, $ne: null },
          "rncp_details.active_inactive": "ACTIVE",
        },
        {
          "rncp_details.code_type_certif": {
            $in: ["Titre", "TP", null],
          },
          rncp_code: { $eq: null },
        },
        {
          "rncp_details.code_type_certif": {
            $nin: ["Titre", "TP", null],
          },
        },
      ],
    },
  ],
};

/**
 * @param {{plateforme: Plateforme, niveau: Niveau, diplome: string, regle_complementaire: string, duree: string, num_academie: number, annee: string}} rule
 */
const getQueryFromRule = (
  { plateforme, niveau, diplome, regle_complementaire, duree, num_academie, annee },
  onlyCataloguePublished = true
) => {
  const query = {
    $and: [getPublishedRules(plateforme, onlyCataloguePublished), titresRule],
    niveau,
    ...(diplome && { diplome }),
    ...getExpireRule(),
    ...(num_academie && { num_academie }),
    ...(duree && { duree: String(duree) }),
    ...(annee && { annee: String(annee) }),
  };

  if (regle_complementaire) {
    query["$and"] = [...query["$and"], deserialize(regle_complementaire)];
  }
  return query;
};

module.exports = {
  serialize,
  deserialize,
  getQueryFromRule,
  getExpireRule,
  titresRule,
  getPublishedRules,
  getExpirationDate,
  getCampagneStartDate,
  getSessionStartDate,
  getSessionEndDate,
  isInSession,
  isInPreviousSession,
  getSessionDateRules,
  getPreviousSessionDateRules,
};
