const psReconciliationSchema = {
  uai_gestionnaire: {
    type: String,
    default: null,
    description: "uai gestionnaire de la formation parcoursup",
  },
  uai_formateur: {
    type: String,
    default: null,
    description: "uai formateur de la formation parcousup",
  },
  uai_affilie: {
    type: String,
    default: null,
    description: "uai affilie de la formation parcoursup",
  },
  siret_formateur: {
    type: String,
    default: null,
    description: "siret de l'établissement formateur",
  },
  siret_gestionnaire: {
    type: String,
    default: null,
    description: "siret de l'établissement gestionnaire",
  },
  siret_formateur_gestionnaire: {
    type: String,
    default: null,
    description: "siret de l'établissement gestionnaire & formateur",
  },
  code_cfd: {
    type: String,
    default: null,
    description:
      "code formation diplome de la formation catalogue rapproché. Valeur récupéré de la formation parcousup ou du catalogue des formations pour les matching 1*",
  },
  id_psformation: {
    type: String,
    default: null,
    description: "id de la formation parcoursup",
  },
};

module.exports = psReconciliationSchema;
