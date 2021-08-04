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

const getQueryFromRule = ({ niveau, diplome, regle_complementaire, duree, num_academie }) => {
  return {
    ...toBePublishedRules,
    niveau,
    ...(diplome && { diplome }),
    ...(regle_complementaire && deserialize(regle_complementaire)),
    ...(duree && getCfdExpireRule(duree)),
    ...(num_academie && { num_academie }),
  };
};

module.exports = { serialize, deserialize, getQueryFromRule };
