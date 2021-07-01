const { toBePublishedRules } = require("../../common/utils/referenceUtils");

const aPublierVerifierAccesDirectPostBacRules = {
  ...toBePublishedRules,
  $or: [
    {
      niveau: "6 (Licence, BUT...)",
      diplome: {
        $in: [
          "TH DE NIV 2 DES CCI ET MINISTERE COMMERCE ARTISANAT PME",
          "TH DE NIV 2 DES CHAMBRES DE METIERS",
          "TH DE NIV 2 DES ORGANISMES ET CHAMBRES D'AGRICULTURE",
          "TH DE NIV 2 EDUCATION RECTORAT GRETA ...",
          "TH DE NIV 2 INSTANCES REGIONALES",
          "TH DE NIV 2 MENRT EDUCATION  UNIVERSITES",
          "TH DE NIV 2 MINISTERE DE L'EQUIPEMENT TRANSPORT TOURISME",
          "TH DE NIV 2 MINISTERE DU TRAVAIL - AFPA",
          "TH DE NIV 2 MINISTERE INDUSTRIE",
          "TH DE NIV 2 ORGANISMES GESTIONNAIRES DIVERS",
          "TH DE NIV 2 REMONTES DES CFA AGRICOLES",
          "TH DE NIV 2 SANTE SOCIAL",
        ],
      },
      $and: [
        {
          "rncp_details.code_type_certif": { $in: ["Titre", "TP"] },
          "rncp_details.active_inactive": "ACTIVE",
        },
      ],
    },
    { niveau: "6 (Licence, BUT...)", diplome: "AUTRES DIPLOMES DE NIVEAU II", $and: [{ libelle_court: "DCG" }] },
  ],
};

const aPublierValidationRecteurRules = {
  ...toBePublishedRules,
  $or: [
    {
      niveau: "4 (BAC...)",
      diplome: "MENTION COMPLEMENTAIRE",
      $and: [
        {
          libelle_court: "MC4",
        },
      ],
    },
  ],
};

const aPublierRules = {
  ...toBePublishedRules,
  $or: [
    {
      niveau: "4 (BAC...)",
      diplome: "CERTIFICAT DE SPECIALISATION AGRICOLE DE NIVEAU 4",
    },
    {
      niveau: "5 (BTS, DEUST...)",
      diplome: {
        $in: ["BREVET DE TECHNICIEN SUPERIEUR", "BREVET DE TECHNICIEN SUPERIEUR AGRICOLE"],
      },
    },
    {
      niveau: "5 (BTS, DEUST...)",
      diplome: "TH DE NIV 3 DES CHAMBRES DE METIERS",
      $and: [{ libelle_court: "BM", niveau_formation_diplome: "36M" }],
    },
    {
      niveau: "5 (BTS, DEUST...)",
      diplome: {
        $in: [
          "TH DE NIV 3 DES CCI ET MINISTERE COMMERCE ARTISANAT PME",
          "TH DE NIV 3 DES CHAMBRES DE METIERS",
          "TH DE NIV 3 EDUCATION RECTORAT GRETA ...",
          "TH DE NIV 3 INSTANCES REGIONALES",
          "TH DE NIV 3 MINISTERE DE L'EQUIPEMENT TRANSPORT TOURISME",
          "TH DE NIV 3 MINISTERE DU TRAVAIL - AFPA",
          "TH DE NIV 3 MINISTERE INDUSTRIE",
          "TH DE NIV 3 ORGANISMES GESTIONNAIRES DIVERS",
          "TH DE NIV 3 SANTE SOCIAL",
        ],
      },
      $and: [{ libelle_court: { $regex: /^TH3-/ } }],
    },
    {
      niveau: "6 (Licence, BUT...)",
      diplome: "TH DE NIV 2 ORGANISMES GESTIONNAIRES DIVERS",
      $and: [{ libelle_court: { $regex: /^TH3-/ } }],
    },
    {
      niveau: "5 (BTS, DEUST...)",
      diplome: {
        $in: [
          "TH DE NIV 3 DES CCI ET MINISTERE COMMERCE ARTISANAT PME",
          "TH DE NIV 3 DES CHAMBRES DE METIERS",
          "TH DE NIV 3 EDUCATION RECTORAT GRETA ...",
          "TH DE NIV 3 INSTANCES REGIONALES",
          "TH DE NIV 3 MINISTERE DE L'EQUIPEMENT TRANSPORT TOURISME",
          "TH DE NIV 3 MINISTERE DU TRAVAIL - AFPA",
          "TH DE NIV 3 MINISTERE INDUSTRIE",
          "TH DE NIV 3 ORGANISMES GESTIONNAIRES DIVERS",
          "TH DE NIV 3 SANTE SOCIAL",
        ],
      },
      $and: [{ "rncp_details.code_type_certif": { $in: ["Titre", "TP"] }, "rncp_details.active_inactive": "ACTIVE" }],
    },
  ],
};

module.exports = { aPublierVerifierAccesDirectPostBacRules, aPublierValidationRecteurRules, aPublierRules };
