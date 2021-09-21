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

const getCfdExpireRule = (duration) => {
  return {
    $or: [
      { cfd_date_fermeture: { $gt: new Date(`${new Date().getFullYear() + duration - 1}-12-31T00:00:00.000Z`) } },
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

const getQueryFromRule = ({ niveau, diplome, regle_complementaire, duree, num_academie }) => {
  const query = {
    ...toBePublishedRules,
    niveau,
    ...(diplome && { diplome }),
    ...(regle_complementaire && deserialize(regle_complementaire)),
    ...(duree && getCfdExpireRule(duree)),
    ...(num_academie && { num_academie }),
  };
  query["$and"] = [...(query["$and"] ?? []), ...titresRule["$and"]];
  return query;
};

module.exports = { serialize, deserialize, getQueryFromRule };
