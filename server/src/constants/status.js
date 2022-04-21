const COMMON_STATUS = {
  HORS_PERIMETRE: "hors périmètre",
  PUBLIE: "publié",
  NON_PUBLIE: "non publié",
  A_PUBLIER: "à publier",
  EN_ATTENTE: "en attente de publication",
};

const PARCOURSUP_STATUS = {
  ...COMMON_STATUS,
  A_PUBLIER_VERIFIER_POSTBAC: "à publier (vérifier accès direct postbac)",
  A_PUBLIER_VALIDATION_RECTEUR: "à publier (soumis à validation Recteur)",
  A_PUBLIER_HABILITATION: "à publier (sous condition habilitation)",
  REJETE: "rejet de publication",
};

const AFFELNET_STATUS = {
  ...COMMON_STATUS,
  A_PUBLIER_VALIDATION: "à publier (soumis à validation)",
};

module.exports = {
  COMMON_STATUS,
  PARCOURSUP_STATUS,
  AFFELNET_STATUS,
};
