const COMMON_STATUS = {
  NON_PUBLIABLE_EN_LETAT: "non publiable en l'état",
  PUBLIE: "publié",
  NON_PUBLIE: "non publié",
  A_PUBLIER: "à publier",
  PRET_POUR_INTEGRATION: "prêt pour intégration",
};

const PARCOURSUP_STATUS = {
  ...COMMON_STATUS,
  A_PUBLIER_VERIFIER_POSTBAC: "à publier (vérifier accès direct postbac)",
  A_PUBLIER_VALIDATION_RECTEUR: "à publier (soumis à validation Recteur)",
  A_PUBLIER_HABILITATION: "à publier (sous condition habilitation)",
  REJETE: "rejet de publication",
  FERME: "fermé",
};

const AFFELNET_STATUS = {
  ...COMMON_STATUS,
  A_DEFINIR: "à définir par l'académie",
  A_PUBLIER_VALIDATION: "à publier (soumis à validation)",
};

module.exports = {
  COMMON_STATUS,
  PARCOURSUP_STATUS,
  AFFELNET_STATUS,
};
