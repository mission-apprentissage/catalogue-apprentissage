const { toBePublishedRules } = require("../../jobs/common/utils/referenceUtils");

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

const getQueryFromRule = ({ niveau, diplome, regle_complementaire }) => {
  return {
    ...toBePublishedRules,
    niveau,
    ...(diplome && { diplome }),
    ...(regle_complementaire && deserialize(regle_complementaire)),
  };
};

module.exports = { serialize, deserialize, getQueryFromRule };
