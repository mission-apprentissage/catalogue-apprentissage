const { toBePublishedRules } = require("../../common/utils/referenceUtils");

const aPublierVerifierAccesDirectPostBacRules = {
  $and: [
    ...toBePublishedRules,
    {
      $or: [
        {
          "rncp_details.code_type_certif": { $in: ["Titre", "TP"] },
          "rncp_details.active_inactive": "ACTIVE",
          niveau: "6 (Licence...)",
        },
        { libelle_court: "DCG" },
      ],
    },
  ],
};

const aPublierValidationRecteurRules = {
  $and: [
    ...toBePublishedRules,
    {
      libelle_court: "MC4",
    },
  ],
};

const aPublierRules = {
  $and: [
    ...toBePublishedRules,
    {
      $or: [
        {
          diplome: {
            $in: [
              "BREVET DE TECHNICIEN SUPERIEUR",
              "BREVET DE TECHNICIEN SUPERIEUR AGRICOLE",
              "CERTIFICAT DE SPECIALISATION AGRICOLE DE NIVEAU 4",
            ],
          },
        },
        {
          $or: [{ libelle_court: "BM", niveau_formation_diplome: "36M" }, { libelle_court: { $regex: /^TH3-/ } }],
        },
        {
          "rncp_details.code_type_certif": { $in: ["Titre", "TP"] },
          "rncp_details.active_inactive": "ACTIVE",
          niveau: "5 (BTS, DUT...)",
        },
      ],
    },
    {
      niveau: { $in: ["4 (Bac...)", "5 (BTS, DUT...)", "6 (Licence...)"] },
    },
  ],
};

module.exports = { aPublierVerifierAccesDirectPostBacRules, aPublierValidationRecteurRules, aPublierRules };
