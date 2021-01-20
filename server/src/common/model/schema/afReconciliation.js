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
};

module.exports = afReconciliationSchema;
