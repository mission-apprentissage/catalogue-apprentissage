const psReconciliationSchema = {
  uai_gestionnaire: {
    type: String,
    default: null,
    description: "uai gestionnaire de la formation parcoursup",
  },
  uai_composante: {
    type: String,
    default: null,
    description: "uai composante de la formation parcousup",
  },
  uai_affilie: {
    type: String,
    default: null,
    description: "uai affilie de la formation parcoursup",
  },
  code_cfd: {
    type: String,
    default: null,
    description: "code formation diplome de la formation parcoursup",
  },
  siret_formateur: {
    type: String,
    default: null,
    description: "siret de l'établissement formateur de la formation parcoursup",
  },
  siret_gestionnaire: {
    type: String,
    default: null,
    description: "siret de l'établissement gestionnaire de la formation parcoursup",
  },
  unpublished_by_user: {
    type: String,
    default: null,
    description: "Email utilisateur si la réconciliation a été dépublié depuis l'interface",
  },
};

module.exports = psReconciliationSchema;
