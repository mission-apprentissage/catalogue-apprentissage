const afReconciliationSchema = {
  uai: {
    type: String,
    default: null,
    description: "uai gestionnaire de la formation affelnet",
  },
  code_cfd: {
    type: String,
    default: null,
    description: "code formation diplome de la formation affelnet",
  },
  siret_formateur: {
    type: String,
    default: null,
    description: "siret de l'établissement formateur de la formation affelnet",
  },
  siret_gestionnaire: {
    type: String,
    default: null,
    description: "siret de l'établissement gestionnaire de la formation affelnet",
  },
  unpublished_by_user: {
    type: String,
    default: null,
    description: "Email utilisateur si la réconciliation a été dépublié depuis l'interface",
  },
  source: {
    type: String,
    default: "MANUEL",
    enum: ["MANUEL", "AUTOMATIQUE"],
    description: "Auteur de la réconciliation (MANUEL : par un utilisateur depuis l'interface / AUTO : par script)",
  },
  code_postal: {
    type: String,
    default: null,
    description: "code postal de la formation du catalogue",
  },
};

module.exports = afReconciliationSchema;
