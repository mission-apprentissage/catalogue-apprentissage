export const COMMON_STATUS = {
  HORS_PERIMETRE: "hors périmètre",
  PUBLIE: "publié",
  NON_PUBLIE: "non publié",
  A_PUBLIER: "à publier",
  EN_ATTENTE: "en attente de publication",
};

export const PARCOURSUP_STATUS = {
  ...COMMON_STATUS,
  A_PUBLIER_VERIFIER_POSTBAC: "à publier (vérifier accès direct postbac)",
  A_PUBLIER_VALIDATION_RECTEUR: "à publier (soumis à validation Recteur)",
};

export const AFFELNET_STATUS = {
  ...COMMON_STATUS,
  A_PUBLIER_VALIDATION: "à publier (soumis à validation)",
};
