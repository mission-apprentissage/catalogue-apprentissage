/* eslint-disable */

const uai = [
  {
    strength: "7",
    query: (f) => {
      return {
        $and: [
          {
            $or: [
              { etablissement_formateur_siret: f.siret_cerfa ?? "" },
              { etablissement_formateur_siret: f.siret_map ?? "" },
              { etablissement_gestionnaire_siret: f.siret_cerfa ?? "" },
              { etablissement_gestionnaire_siret: f.siret_map ?? "" },
            ],
          },
          {
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
          },
          {
            $or: [{ rncp_code: { $in: f.codes_rncp_mna } }, { cfd_entree: { $in: f.codes_cfd_mna } }],
          },
        ],
        code_commune_insee: f.code_commune_insee,
        nom_academie: f.nom_academie,
      };
    },
  },
  {
    strength: "6",
    query: (f) => {
      return {
        $and: [
          {
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
          },
          {
            $or: [
              { etablissement_gestionnaire_code_postal: f.code_postal },
              { etablissement_formateur_code_postal: f.code_postal },
              { code_postal: f.code_postal },
            ],
          },
          {
            $or: [{ rncp_code: { $in: f.codes_rncp_mna } }, { cfd_entree: { $in: f.codes_cfd_mna } }],
          },
        ],
        code_commune_insee: f.code_commune_insee,
        nom_academie: f.nom_academie,
      };
    },
  },
];

const cfd = [
  {
    strength: "7",
    query: (f) => {
      return {
        $and: [
          {
            $or: [
              { etablissement_formateur_siret: f.siret_cerfa ?? "" },
              { etablissement_formateur_siret: f.siret_map ?? "" },
              { etablissement_gestionnaire_siret: f.siret_cerfa ?? "" },
              { etablissement_gestionnaire_siret: f.siret_map ?? "" },
            ],
          },
          {
            $or: [{ rncp_code: { $in: f.codes_rncp_mna } }, { cfd_entree: { $in: f.codes_cfd_mna } }],
          },
        ],
        code_commune_insee: f.code_commune_insee,
        nom_academie: f.nom_academie,
      };
    },
  },
  {
    strength: "6",
    query: (f) => {
      return {
        $and: [
          {
            $or: [
              { etablissement_gestionnaire_code_postal: f.code_postal },
              { etablissement_formateur_code_postal: f.code_postal },
              { code_postal: f.code_postal },
            ],
          },
          {
            $or: [{ rncp_code: { $in: f.codes_rncp_mna } }, { cfd_entree: { $in: f.codes_cfd_mna } }],
          },
        ],
        code_commune_insee: f.code_commune_insee,
        nom_academie: f.nom_academie,
      };
    },
  },
];

const psRules = [
  {
    strength: "7", // With UAI
    query: (f) => {
      return {
        $and: [
          {
            $or: [
              { etablissement_formateur_siret: f.siret_cerfa ?? "" },
              { etablissement_formateur_siret: f.siret_map ?? "" },
              { etablissement_gestionnaire_siret: f.siret_cerfa ?? "" },
              { etablissement_gestionnaire_siret: f.siret_map ?? "" },
            ],
          },
          {
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
          },
          {
            $or: [{ rncp_code: { $in: f.codes_rncp_mna } }, { cfd_entree: { $in: f.codes_cfd_mna } }],
          },
        ],
        code_commune_insee: f.code_commune_insee,
        nom_academie: f.nom_academie,
      };
    },
  },
  {
    strength: "7",
    query: (f) => {
      return {
        $and: [
          {
            $or: [
              { etablissement_formateur_siret: f.siret_cerfa ?? "" },
              { etablissement_formateur_siret: f.siret_map ?? "" },
              { etablissement_gestionnaire_siret: f.siret_cerfa ?? "" },
              { etablissement_gestionnaire_siret: f.siret_map ?? "" },
            ],
          },
          {
            $or: [{ rncp_code: { $in: f.codes_rncp_mna } }, { cfd_entree: { $in: f.codes_cfd_mna } }],
          },
        ],
        code_commune_insee: f.code_commune_insee,
        nom_academie: f.nom_academie,
      };
    },
  },
  {
    strength: "6", // With UAI
    query: (f) => {
      return {
        $and: [
          {
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
          },
          {
            $or: [
              { etablissement_gestionnaire_code_postal: f.code_postal },
              { etablissement_formateur_code_postal: f.code_postal },
              { code_postal: f.code_postal },
            ],
          },
          {
            $or: [{ rncp_code: { $in: f.codes_rncp_mna } }, { cfd_entree: { $in: f.codes_cfd_mna } }],
          },
        ],
        code_commune_insee: f.code_commune_insee,
        nom_academie: f.nom_academie,
      };
    },
  },
  {
    strength: "6",
    query: (f) => {
      return {
        $and: [
          {
            $or: [
              { etablissement_gestionnaire_code_postal: f.code_postal },
              { etablissement_formateur_code_postal: f.code_postal },
              { code_postal: f.code_postal },
            ],
          },
          {
            $or: [{ rncp_code: { $in: f.codes_rncp_mna } }, { cfd_entree: { $in: f.codes_cfd_mna } }],
          },
        ],
        code_commune_insee: f.code_commune_insee,
        nom_academie: f.nom_academie,
      };
    },
  },
  {
    strength: "5", // With UAI
    query: (f) => {
      return {
        $and: [
          {
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
          },
          {
            $or: [
              { etablissement_gestionnaire_code_postal: f.code_postal },
              { etablissement_formateur_code_postal: f.code_postal },
              { code_postal: f.code_postal },
            ],
          },
          {
            $or: [{ rncp_code: { $in: f.codes_rncp_mna } }, { cfd_entree: { $in: f.codes_cfd_mna } }],
          },
        ],
        code_commune_insee: f.code_commune_insee,
      };
    },
  },
  {
    strength: "5",
    query: (f) => {
      return {
        $and: [
          {
            $or: [
              { etablissement_gestionnaire_code_postal: f.code_postal },
              { etablissement_formateur_code_postal: f.code_postal },
              { code_postal: f.code_postal },
            ],
          },
          {
            $or: [{ rncp_code: { $in: f.codes_rncp_mna } }, { cfd_entree: { $in: f.codes_cfd_mna } }],
          },
        ],
        code_commune_insee: f.code_commune_insee,
      };
    },
  },

  {
    strength: "3", // With UAI
    query: (f) => {
      return {
        $and: [
          {
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
          },
          {
            $or: [{ rncp_code: { $in: f.codes_rncp_mna } }, { cfd_entree: { $in: f.codes_cfd_mna } }],
          },
        ],
        code_commune_insee: f.code_commune_insee,
      };
    },
  },
  {
    strength: "3",
    query: (f) => {
      return {
        $and: [
          {
            $or: [{ rncp_code: { $in: f.codes_rncp_mna } }, { cfd_entree: { $in: f.codes_cfd_mna } }],
          },
        ],
        code_commune_insee: f.code_commune_insee,
      };
    },
  },
];

module.exports = { uai, cfd, psRules };
