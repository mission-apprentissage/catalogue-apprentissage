const { toBePublishedRules } = require("../../common/utils/referenceUtils");

const getMefRule = (regex) => {
  return { "bcn_mefs_10.mef10": { $regex: regex } };
};

const aPublierSoumisAValidationRules = {
  ...toBePublishedRules,
  $or: [
    {
      niveau: "3 (CAP...)",
      diplome: "CERTIFICAT D'APTITUDES PROFESSIONNELLES",
      duree: 1,
      $and: [getMefRule(/11$/), getMefRule(/^240/)],
    },
    {
      niveau: "3 (CAP...)",
      diplome: "CERTIFICAT D'APTITUDES PROFESSIONNELLES",
      duree: 3,
      $and: [getMefRule(/31$/), getMefRule(/^242/)],
    },
    {
      niveau: "4 (BAC...)",
      diplome: "BAC PROFESSIONNEL",
      duree: 2,
      $and: [getMefRule(/21$/), getMefRule(/^246/)],
    },
    {
      niveau: "4 (BAC...)",
      diplome: "BAC PROFESSIONNEL AGRICOLE",
      duree: 2,
      $and: [getMefRule(/21$/), getMefRule(/^273/)],
    },
    {
      niveau: "4 (BAC...)",
      diplome: "BREVET PROFESSIONNEL",
      duree: 2,
      $and: [getMefRule(/21$/), getMefRule(/^254/)],
    },
    {
      niveau: "4 (BAC...)",
      diplome: "BREVET PROFESSIONNEL AGRICOLE DE NIVEAU IV",
      duree: 2,
      $and: [getMefRule(/21$/), getMefRule(/^254/)],
    },
    {
      niveau: "3 (CAP...)",
      diplome: "BREVET PROFESSIONNEL AGRICOLE DE NIVEAU V",
      duree: 2,
      $and: [getMefRule(/21$/), getMefRule(/^254/)],
    },
    {
      niveau: "4 (BAC...)",
      diplome: "BREVET DES METIERS D'ART - BREVET DES METIERS DU SPECTACLE",
      duree: 2,
      $and: [getMefRule(/21$/), getMefRule(/^251/)],
    },
    {
      niveau: "3 (CAP...)",
      diplome: "MENTION COMPLEMENTAIRE",
      duree: 1,
      $and: [getMefRule(/11$/), getMefRule(/^253/)],
    },
    {
      niveau: "3 (CAP...)",
      diplome: "MENTION COMPLEMENTAIRE AGRICOLE", // FIXME J'ai pas ça
      duree: 1,
      $and: [getMefRule(/11$/), getMefRule(/^274/)],
    },
  ],
};

const aPublierRules = {
  ...toBePublishedRules,
  $or: [
    {
      niveau: "3 (CAP...)",
      diplome: "CERTIFICAT D'APTITUDES PROFESSIONNELLES",
      duree: 2,
      $and: [getMefRule(/21$/), getMefRule(/^241/)],
    },
    {
      niveau: "3 (CAP...)",
      diplome: "CERTIFICAT D'APTITUDES PROFESSIONNELLES AGRICOLES",
      duree: 2,
      $and: [getMefRule(/21$/), getMefRule(/^271/)],
    },
    {
      niveau: "4 (BAC...)",
      diplome: "BAC PROFESSIONNEL",
      duree: 3,
      $and: [getMefRule(/31$/), getMefRule(/^247/)],
    },
    {
      niveau: "4 (BAC...)",
      diplome: "BAC PROFESSIONNEL AGRICOLE",
      duree: 3,
      $and: [getMefRule(/31$/), getMefRule(/^276/)],
    },
  ],
};

module.exports = { aPublierSoumisAValidationRules, aPublierRules };
