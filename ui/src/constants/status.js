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
  A_PUBLIER_HABILITATION: "à publier (sous condition habilitation)",
  REJETE: "rejet de publication",
  FERME: "fermé",
};

export const AFFELNET_STATUS = {
  ...COMMON_STATUS,
  A_PUBLIER_VALIDATION: "à publier (soumis à validation)",
  A_PUBLIER_RESERVE_BAC_PRO_3_ANS_EN_2_ANS: "à publier sous réserve (Bac pro de 3 ans en 2 ans)",
};
