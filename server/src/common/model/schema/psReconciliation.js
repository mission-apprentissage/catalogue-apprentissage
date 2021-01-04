const psReconciliationSchema = {
  etablissement: [
    {
      id: {
        type: String,
        default: null,
        description: "Identifiant de l'établissement catalogue lié à la formation parcoursup",
      },
      type: {
        type: String,
        default: null,
        description: "Type d'établissement lié à la formation parcousup",
      },
    },
  ],
  code_cfd_formation: {
    type: String,
    default: null,
    description:
      "Code formation diplome de la formation catalogue rapproché. Valeur récupéré de la formation parcousup ou du catalogue des formations pour les matching 1*",
  },
  code_postal_formation: {
    type: String,
    default: null,
    description:
      "Code postal de la formation catalogue rapproché. Valeur récupéré de la formation parcousup ou du catalogue des formations pour les matching 1* ",
  },
  id_formation_mna: {
    type: String,
    default: null,
    description: "Id de la formation catalogue",
  },
  id_formation_ps: {
    type: String,
    default: null,
    description: "Id de la formation parcoursup",
  },
  annee_formation: {
    type: String,
    default: null,
    description: "Année de la formation parcousup",
  },
};

module.exports = psReconciliationSchema;
