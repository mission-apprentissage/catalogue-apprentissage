// @ts-check

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

/**
 * Pour appliquer les étiquettes pour les plateformes PS & Affelnet
 * une formation doit avoir au moins une période de début de formation >= septembre de l'année scolaire suivante
 * eg: si on est en janvier 2022 --> septembre 2022, si on est le en octobre 2022 --> septembre 2023, etc.
 * Si ce n'est pas le cas la formation sera "hors périmètre".
 *
 * @param {Date} [currentDate]
 * @returns {Date}
 */
const getPeriodeStartDate = (currentDate = new Date()) => {
  let durationShift = 0;
  const now = currentDate;
  const sessionStart = new Date(`${currentDate.getFullYear()}-09-01T00:00:00.000Z`);
  if (now >= sessionStart) {
    durationShift = 1;
  }
  return new Date(`${currentDate.getFullYear() + durationShift}-09-01T00:00:00.000Z`);
};

const commonRules = {
  $or: [
    {
      "rncp_details.code_type_certif": {
        $in: ["Titre", "TP"],
      },
      "rncp_details.rncp_outdated": { $ne: true },
    },
    {
      "rncp_details.code_type_certif": {
        $nin: ["Titre", "TP"],
      },
      cfd_outdated: { $ne: true },
    },
  ],
  published: true,
  etablissement_reference_catalogue_published: true,
  etablissement_gestionnaire_catalogue_published: true, // ensure gestionnaire is Qualiopi certified
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
const getPublishedRules = (plateforme) => {
  switch (plateforme) {
    case "affelnet":
      return toBePublishedRulesAffelnet;

    case "parcoursup":
      return toBePublishedRulesParcousup;

    default:
      throw new Error(`Invalid plateforme : ${plateforme}`);
  }
};

/**
 * Update du 17/01/2022
 * Suite aux discussions avec Christine Bourdin et Rachel Bourdon,
 * la règle est d'envoyer les formations aux plateformes pour le cfd ou le rncp qui n'expire pas :
 * du 01/10/N au 31/08/N+1
 */
const getExpireRule = (currentDate = new Date()) => {
  let durationShift = 1;
  const now = currentDate;
  const sessionStart = new Date(`${currentDate.getFullYear()}-10-01T00:00:00.000Z`);
  if (now >= sessionStart) {
    durationShift = 0;
  }

  const thresholdDate = new Date(`${currentDate.getFullYear() + 1 - durationShift}-08-31T00:00:00.000Z`);

  return {
    $or: [
      {
        "rncp_details.code_type_certif": {
          $nin: ["Titre", "TP"],
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
      {
        "rncp_details.code_type_certif": {
          $in: ["Titre", "TP"],
        },
        $or: [
          {
            "rncp_details.date_fin_validite_enregistrement": {
              $gt: thresholdDate,
            },
          },
          { "rncp_details.date_fin_validite_enregistrement": null },
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
            $in: ["Titre", "TP"],
          },
          "rncp_details.active_inactive": "ACTIVE",
        },
        {
          "rncp_details.code_type_certif": {
            $nin: ["Titre", "TP"],
          },
        },
      ],
    },
  ],
};

/**
 * @param {{plateforme: Plateforme, niveau: Niveau, diplome: string, regle_complementaire: string, duree: string, num_academie: number, annee: string}} rule
 */
const getQueryFromRule = ({ plateforme, niveau, diplome, regle_complementaire, duree, num_academie, annee }) => {
  const query = {
    $and: [getPublishedRules(plateforme), titresRule],
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
  getPeriodeStartDate,
};
