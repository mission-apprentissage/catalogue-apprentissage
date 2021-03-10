/* eslint-disable */

const uai = [
  {
    strength: "7",
    query: (f) => {
      return {
        $or: [
          { uai_formation: f.uai_affilie },
          { uai_formation: f.uai_gestionnaire },
          { uai_formation: f.uai_composante },
          { uai_formation: f.uai_insert_jeune ?? "" },
          { uai_formation: f.uai_cerfa ?? "" },
          { uai_formation: f.uai_map ?? "" },
          { etablissement_formateur_uai: f.uai_affilie },
          { etablissement_formateur_uai: f.uai_composante },
          { etablissement_formateur_uai: f.uai_gestionnaire },
          { etablissement_formateur_uai: f.uai_insert_jeune ?? "" },
          { etablissement_formateur_uai: f.uai_cerfa ?? "" },
          { etablissement_formateur_uai: f.uai_map ?? "" },
          { etablissement_gestionnaire_uai: f.uai_affilie },
          { etablissement_gestionnaire_uai: f.uai_composante },
          { etablissement_gestionnaire_uai: f.uai_gestionnaire },
          { etablissement_gestionnaire_uai: f.uai_insert_jeune ?? "" },
          { etablissement_gestionnaire_uai: f.uai_cerfa ?? "" },
          { etablissement_gestionnaire_uai: f.uai_map ?? "" },
        ],
        $or: [
          { etablissement_formateur_siret: f.siret_cerfa ?? "" },
          { etablissement_formateur_siret: f.siret_map ?? "" },
          { etablissement_gestionnaire_siret: f.siret_cerfa ?? "" },
          { etablissement_gestionnaire_siret: f.siret_map ?? "" },
        ],
        code_commune_insee: f.code_commune_insee,
        nom_academie: f.nom_academie,
        cfd: f.code_cfd,
      };
    },
  },
  {
    strength: "6",
    query: (f) => {
      return {
        $or: [
          { uai_formation: f.uai_affilie },
          { uai_formation: f.uai_gestionnaire },
          { uai_formation: f.uai_composante },
          { uai_formation: f.uai_insert_jeune ?? "" },
          { uai_formation: f.uai_cerfa ?? "" },
          { uai_formation: f.uai_map ?? "" },
          { etablissement_formateur_uai: f.uai_affilie },
          { etablissement_formateur_uai: f.uai_composante },
          { etablissement_formateur_uai: f.uai_gestionnaire },
          { etablissement_formateur_uai: f.uai_insert_jeune ?? "" },
          { etablissement_formateur_uai: f.uai_cerfa ?? "" },
          { etablissement_formateur_uai: f.uai_map ?? "" },
          { etablissement_gestionnaire_uai: f.uai_affilie },
          { etablissement_gestionnaire_uai: f.uai_composante },
          { etablissement_gestionnaire_uai: f.uai_gestionnaire },
          { etablissement_gestionnaire_uai: f.uai_insert_jeune ?? "" },
          { etablissement_gestionnaire_uai: f.uai_cerfa ?? "" },
          { etablissement_gestionnaire_uai: f.uai_map ?? "" },
        ],
        $or: [
          { etablissement_gestionnaire_code_postal: f.code_postal },
          { etablissement_formateur_code_postal: f.code_postal },
          { code_postal: f.code_postal },
        ],
        code_commune_insee: f.code_commune_insee,
        nom_academie: f.nom_academie,
        cfd: f.code_cfd,
        mef_10_code: f.code_mef_10,
      };
    },
  },
  {
    strength: "5",
    query: (f) => {
      return {
        $or: [
          { uai_formation: f.uai_affilie },
          { uai_formation: f.uai_gestionnaire },
          { uai_formation: f.uai_composante },
          { uai_formation: f.uai_insert_jeune ?? "" },
          { uai_formation: f.uai_cerfa ?? "" },
          { uai_formation: f.uai_map ?? "" },
          { etablissement_formateur_uai: f.uai_affilie },
          { etablissement_formateur_uai: f.uai_composante },
          { etablissement_formateur_uai: f.uai_gestionnaire },
          { etablissement_formateur_uai: f.uai_insert_jeune ?? "" },
          { etablissement_formateur_uai: f.uai_cerfa ?? "" },
          { etablissement_formateur_uai: f.uai_map ?? "" },
          { etablissement_gestionnaire_uai: f.uai_affilie },
          { etablissement_gestionnaire_uai: f.uai_composante },
          { etablissement_gestionnaire_uai: f.uai_gestionnaire },
          { etablissement_gestionnaire_uai: f.uai_insert_jeune ?? "" },
          { etablissement_gestionnaire_uai: f.uai_cerfa ?? "" },
          { etablissement_gestionnaire_uai: f.uai_map ?? "" },
        ],
        $or: [
          { etablissement_gestionnaire_code_postal: f.code_postal },
          { etablissement_formateur_code_postal: f.code_postal },
          { code_postal: f.code_postal },
        ],
        code_commune_insee: f.code_commune_insee,
        nom_academie: f.nom_academie,
        cfd: f.code_cfd,
      };
    },
  },
  {
    strength: "4",
    query: (f) => {
      return {
        $or: [
          { uai_formation: f.uai_affilie },
          { uai_formation: f.uai_gestionnaire },
          { uai_formation: f.uai_composante },
          { uai_formation: f.uai_insert_jeune ?? "" },
          { uai_formation: f.uai_cerfa ?? "" },
          { uai_formation: f.uai_map ?? "" },
          { etablissement_formateur_uai: f.uai_affilie },
          { etablissement_formateur_uai: f.uai_composante },
          { etablissement_formateur_uai: f.uai_gestionnaire },
          { etablissement_formateur_uai: f.uai_insert_jeune ?? "" },
          { etablissement_formateur_uai: f.uai_cerfa ?? "" },
          { etablissement_formateur_uai: f.uai_map ?? "" },
          { etablissement_gestionnaire_uai: f.uai_affilie },
          { etablissement_gestionnaire_uai: f.uai_composante },
          { etablissement_gestionnaire_uai: f.uai_gestionnaire },
          { etablissement_gestionnaire_uai: f.uai_insert_jeune ?? "" },
          { etablissement_gestionnaire_uai: f.uai_cerfa ?? "" },
          { etablissement_gestionnaire_uai: f.uai_map ?? "" },
        ],
        $or: [
          { etablissement_gestionnaire_code_postal: f.code_postal },
          { etablissement_formateur_code_postal: f.code_postal },
          { code_postal: f.code_postal },
        ],
        code_commune_insee: f.code_commune_insee,
        cfd: f.code_cfd,
      };
    },
  },
  {
    strength: "3",
    query: (f) => {
      return {
        $or: [
          { uai_formation: f.uai_affilie },
          { uai_formation: f.uai_gestionnaire },
          { uai_formation: f.uai_composante },
          { uai_formation: f.uai_insert_jeune ?? "" },
          { uai_formation: f.uai_cerfa ?? "" },
          { uai_formation: f.uai_map ?? "" },
          { etablissement_formateur_uai: f.uai_affilie },
          { etablissement_formateur_uai: f.uai_composante },
          { etablissement_formateur_uai: f.uai_gestionnaire },
          { etablissement_formateur_uai: f.uai_insert_jeune ?? "" },
          { etablissement_formateur_uai: f.uai_cerfa ?? "" },
          { etablissement_formateur_uai: f.uai_map ?? "" },
          { etablissement_gestionnaire_uai: f.uai_affilie },
          { etablissement_gestionnaire_uai: f.uai_composante },
          { etablissement_gestionnaire_uai: f.uai_gestionnaire },
          { etablissement_gestionnaire_uai: f.uai_insert_jeune ?? "" },
          { etablissement_gestionnaire_uai: f.uai_cerfa ?? "" },
          { etablissement_gestionnaire_uai: f.uai_map ?? "" },
        ],
        code_commune_insee: f.code_commune_insee,
        cfd: f.code_cfd,
      };
    },
  },
  {
    strength: "2",
    query: (f) => {
      return {
        $or: [
          { uai_formation: f.uai_affilie },
          { uai_formation: f.uai_gestionnaire },
          { uai_formation: f.uai_composante },
          { uai_formation: f.uai_insert_jeune ?? "" },
          { uai_formation: f.uai_cerfa ?? "" },
          { uai_formation: f.uai_map ?? "" },
          { etablissement_formateur_uai: f.uai_affilie },
          { etablissement_formateur_uai: f.uai_composante },
          { etablissement_formateur_uai: f.uai_gestionnaire },
          { etablissement_formateur_uai: f.uai_insert_jeune ?? "" },
          { etablissement_formateur_uai: f.uai_cerfa ?? "" },
          { etablissement_formateur_uai: f.uai_map ?? "" },
          { etablissement_gestionnaire_uai: f.uai_affilie },
          { etablissement_gestionnaire_uai: f.uai_composante },
          { etablissement_gestionnaire_uai: f.uai_gestionnaire },
          { etablissement_gestionnaire_uai: f.uai_insert_jeune ?? "" },
          { etablissement_gestionnaire_uai: f.uai_cerfa ?? "" },
          { etablissement_gestionnaire_uai: f.uai_map ?? "" },
        ],
        cfd: f.code_cfd,
        num_departement: f.code_postal.substring(2, 0),
      };
    },
  },
  // {
  //   strength: "1",
  //   query: (f) => {
  //     return {
  //       $or: [
  //         { uai_formation: f.uai_affilie },
  //         { uai_formation: f.uai_gestionnaire },
  //         { uai_formation: f.uai_composante },
  //         { uai_formation: f.uai_insert_jeune ?? "" },
  //         { uai_formation: f.uai_cerfa ?? "" },
  //         { uai_formation: f.uai_map ?? "" },
  //         { etablissement_formateur_uai: f.uai_affilie },
  //         { etablissement_formateur_uai: f.uai_composante },
  //         { etablissement_formateur_uai: f.uai_gestionnaire },
  //         { etablissement_formateur_uai: f.uai_insert_jeune ?? "" },
  //         { etablissement_formateur_uai: f.uai_cerfa ?? "" },
  //         { etablissement_formateur_uai: f.uai_map ?? "" },
  //         { etablissement_gestionnaire_uai: f.uai_affilie },
  //         { etablissement_gestionnaire_uai: f.uai_composante },
  //         { etablissement_gestionnaire_uai: f.uai_gestionnaire },
  //         { etablissement_gestionnaire_uai: f.uai_insert_jeune ?? "" },
  //         { etablissement_gestionnaire_uai: f.uai_cerfa ?? "" },
  //         { etablissement_gestionnaire_uai: f.uai_map ?? "" },
  //       ],
  //     };
  //   },
  // },
];

const cfd = [
  {
    strength: "7",
    query: (f) => {
      return {
        $or: [
          { etablissement_formateur_siret: f.siret_cerfa ?? "" },
          { etablissement_formateur_siret: f.siret_map ?? "" },
          { etablissement_gestionnaire_siret: f.siret_cerfa ?? "" },
          { etablissement_gestionnaire_siret: f.siret_map ?? "" },
        ],
        cfd: f.code_cfd,
        code_commune_insee: f.code_commune_insee,
        nom_academie: f.nom_academie,
      };
    },
  },
  {
    strength: "6",
    query: (f) => {
      return {
        $or: [
          { etablissement_gestionnaire_code_postal: f.code_postal },
          { etablissement_formateur_code_postal: f.code_postal },
          { code_postal: f.code_postal },
        ],
        cfd: f.code_cfd,
        code_commune_insee: f.code_commune_insee,
        nom_academie: f.nom_academie,
        mef_10_code: f.code_mef_10,
      };
    },
  },
  {
    strength: "5",
    query: (f) => {
      return {
        $or: [
          { etablissement_gestionnaire_code_postal: f.code_postal },
          { etablissement_formateur_code_postal: f.code_postal },
          { code_postal: f.code_postal },
        ],
        cfd: f.code_cfd,
        code_commune_insee: f.code_commune_insee,
        nom_academie: f.nom_academie,
      };
    },
  },
  {
    strength: "4",
    query: (f) => {
      return {
        $or: [
          { etablissement_gestionnaire_code_postal: f.code_postal },
          { etablissement_formateur_code_postal: f.code_postal },
          { code_postal: f.code_postal },
        ],
        cfd: f.code_cfd,
        code_commune_insee: f.code_commune_insee,
      };
    },
  },
  {
    strength: "3",
    query: (f) => {
      return {
        cfd: f.code_cfd,
        code_commune_insee: f.code_commune_insee,
      };
    },
  },
  {
    strength: "2",
    query: (f) => {
      return {
        cfd: f.code_cfd,
        num_departement: f.code_postal.substring(2, 0),
      };
    },
  },
  // {
  //   strength: "1",
  //   query: (f) => {
  //     return {
  //       cfd: f.code_cfd,
  //     };
  //   },
  // },
];

module.exports = { uai, cfd };
