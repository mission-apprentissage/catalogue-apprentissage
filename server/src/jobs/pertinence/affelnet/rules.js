const { toBePublishedRules } = require("../../common/utils/referenceUtils");

const getCfdExpireRule = (duration) => {
  const currentYear = new Date().getFullYear();
  const limitYear = currentYear + duration - 1;
  return {
    $or: [{ cfd_date_fermeture: { $gt: new Date(`${limitYear}-12-31T00:00:00.000Z`) } }, { cfd_date_fermeture: null }],
  };
};

const getMefRule = (...args) => {
  const rule = args.reduce((acc, regex) => {
    return [...acc, { mef_10_code: { $regex: regex } }, { "bcn_mefs_10.mef10": { $regex: regex } }];
  }, []);
  return { $or: rule };
};

const aPublierSoumisAValidationRules = {
  $and: [
    ...toBePublishedRules,
    {
      $or: [
        {
          niveau: { $in: ["3 (CAP...)", "4 (BAC...)"] },
          diplome: "CERTIFICAT D'APTITUDES PROFESSIONNELLES",
          $or: [
            {
              ...getMefRule(/11$/),
              $and: [getMefRule(/^240/), getCfdExpireRule(1)],
            },
            {
              ...getMefRule(/31$/),
              $and: [getMefRule(/^242/), getCfdExpireRule(3)],
            },
          ],
        },
        {
          niveau: { $in: ["3 (CAP...)", "4 (BAC...)"] },
          diplome: "BAC PROFESSIONNEL",
          ...getMefRule(/21$/),
          $and: [getMefRule(/^246/), getCfdExpireRule(2)],
        },
        {
          niveau: { $in: ["3 (CAP...)", "4 (BAC...)"] },
          diplome: "BAC PROFESSIONNEL AGRICOLE",
          ...getMefRule(/21$/),
          $and: [getMefRule(/^273/), getCfdExpireRule(2)],
        },
        {
          niveau: { $in: ["3 (CAP...)", "4 (BAC...)"] },
          diplome: "BREVET PROFESSIONNEL",
          ...getMefRule(/21$/),
          $and: [getMefRule(/^254/), getCfdExpireRule(2)],
        },
        {
          niveau: { $in: ["3 (CAP...)", "4 (BAC...)"] },
          diplome: "BREVET PROFESSIONNEL AGRICOLE",
          ...getMefRule(/21$/),
          $and: [getMefRule(/^254/), getCfdExpireRule(2)],
        },
        {
          niveau: { $in: ["3 (CAP...)", "4 (BAC...)"] },
          diplome: "BREVET DES METIERS D'ART - BREVET DES METIERS DU SPECTACLE",
          ...getMefRule(/21$/),
          $and: [getMefRule(/^251/), getCfdExpireRule(2)],
        },
        {
          niveau: "3 (CAP...)",
          diplome: "MENTION COMPLEMENTAIRE",
          ...getMefRule(/11$/),
          $and: [getMefRule(/^253/), getCfdExpireRule(1)],
        },
        {
          niveau: "3 (CAP...)",
          diplome: "MENTION COMPLEMENTAIRE AGRICOLE",
          ...getMefRule(/11$/),
          $and: [getMefRule(/^274/), getCfdExpireRule(1)],
        },
      ],
    },
  ],
};

const aPublierRules = {
  $and: [
    ...toBePublishedRules,
    {
      $or: [
        {
          niveau: { $in: ["3 (CAP...)", "4 (BAC...)"] },
          diplome: "CERTIFICAT D'APTITUDES PROFESSIONNELLES",
          ...getMefRule(/21$/),
          $and: [getMefRule(/^241/), getCfdExpireRule(2)],
        },
        {
          niveau: { $in: ["3 (CAP...)", "4 (BAC...)"] },
          diplome: "CERTIFICAT D'APTITUDES PROFESSIONNELLES AGRICOLES",
          ...getMefRule(/21$/),
          $and: [getMefRule(/^271/), getCfdExpireRule(2)],
        },
        {
          niveau: { $in: ["3 (CAP...)", "4 (BAC...)"] },
          diplome: "BAC PROFESSIONNEL",
          ...getMefRule(/31$/),
          $and: [getMefRule(/^247/), getCfdExpireRule(3)],
        },
        {
          niveau: { $in: ["3 (CAP...)", "4 (BAC...)"] },
          diplome: "BAC PROFESSIONNEL AGRICOLE",
          ...getMefRule(/31$/),
          $and: [getMefRule(/^276/), getCfdExpireRule(3)],
        },
      ],
    },
  ],
};

module.exports = { aPublierSoumisAValidationRules, aPublierRules };
