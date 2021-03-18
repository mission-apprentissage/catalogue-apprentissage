const { toBePublishedRules } = require("../../common/utils/referenceUtils");

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
          diplome: "CERTIFICAT D'APTITUDES PROFESSIONNELLES",
          $or: [
            {
              ...getMefRule(/11$/),
              $and: [getMefRule(/^240/)],
            },
            {
              ...getMefRule(/31$/),
              $and: [getMefRule(/^242/)],
            },
          ],
        },
        {
          diplome: "BAC PROFESSIONNEL",
          ...getMefRule(/21$/),
          $and: [getMefRule(/^246/)],
        },
        {
          diplome: "BAC PROFESSIONNEL AGRICOLE",
          ...getMefRule(/21$/),
          $and: [getMefRule(/^273/)],
        },

        {
          diplome: "BREVET PROFESSIONNEL",
          ...getMefRule(/21$/),
          $and: [getMefRule(/^254/)],
        },
        {
          diplome: "BREVET PROFESSIONNEL AGRICOLE",
          ...getMefRule(/21$/),
          $and: [getMefRule(/^254/)],
        },
        {
          diplome: "BREVET DES METIERS D'ART - BREVET DES METIERS DU SPECTACLE",
          ...getMefRule(/21$/),
          $and: [getMefRule(/^251/)],
        },
        {
          diplome: "MENTION COMPLEMENTAIRE",
          niveau: "3 (CAP...)",
          ...getMefRule(/11$/),
          $and: [getMefRule(/^253/)],
        },
        {
          diplome: "MENTION COMPLEMENTAIRE AGRICOLE",
          niveau: "3 (CAP...)",
          ...getMefRule(/11$/),
          $and: [getMefRule(/^274/)],
        },
      ],
    },
    {
      niveau: { $in: ["3 (CAP...)", "4 (Bac...)"] },
    },
  ],
};

const aPublierRules = {
  $and: [
    ...toBePublishedRules,
    {
      $or: [
        {
          diplome: "CERTIFICAT D'APTITUDES PROFESSIONNELLES",
          ...getMefRule(/21$/),
          $and: [getMefRule(/^241/)],
        },
        {
          diplome: "CERTIFICAT D'APTITUDES PROFESSIONNELLES AGRICOLES",
          ...getMefRule(/21$/),
          $and: [getMefRule(/^271/)],
        },
        {
          diplome: "BAC PROFESSIONNEL",
          ...getMefRule(/31$/),
          $and: [getMefRule(/^247/)],
        },
        {
          diplome: "BAC PROFESSIONNEL AGRICOLE",
          ...getMefRule(/31$/),
          $and: [getMefRule(/^276/)],
        },
      ],
    },
    {
      niveau: { $in: ["3 (CAP...)", "4 (Bac...)"] },
    },
  ],
};

module.exports = { aPublierSoumisAValidationRules, aPublierRules };
