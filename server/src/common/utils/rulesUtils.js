const { toBePublishedRules } = require("./referenceUtils");

const serialize = (obj) => {
  return JSON.stringify(obj, (key, value) => {
    if (key === "$regex") {
      return value.source;
    }
    return value;
  });
};

const deserialize = (str) => {
  return JSON.parse(str, (key, value) => {
    if (key === "$regex") {
      return new RegExp(value);
    }
    return value;
  });
};

/**
 * Suite aux discussions avec Christine Bourdin et Rachel Bourdon,
 * la règle est d'envoyer les formations aux plateformes pour le cfd qui n'expire pas :
 * du 01/10/N au 31/08/N + durée (-1)
 */
const getCfdExpireRule = (duration, currentDate = new Date()) => {
  let durationShift = 1;
  const now = currentDate;
  const sessionStart = new Date(`${currentDate.getFullYear()}-10-01T00:00:00.000Z`);
  if (now >= sessionStart) {
    durationShift = 0;
  }

  return {
    $or: [
      {
        cfd_date_fermeture: {
          $gt: new Date(`${currentDate.getFullYear() + duration - durationShift}-08-31T00:00:00.000Z`),
        },
      },
      { cfd_date_fermeture: null },
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

const getQueryFromRule = ({ niveau, diplome, regle_complementaire, duree, num_academie /*, annee*/ }) => {
  const query = {
    ...toBePublishedRules,
    niveau,
    ...(diplome && { diplome }),
    ...(regle_complementaire && deserialize(regle_complementaire)),
    ...(duree && getCfdExpireRule(duree)),
    ...(num_academie && { num_academie }),
    // ...(annee && { annee }), // TODO when modalite will be available in RCO data
  };
  query["$and"] = [...(query["$and"] ?? []), ...titresRule["$and"]];
  return query;
};

module.exports = { serialize, deserialize, getQueryFromRule, getCfdExpireRule };
