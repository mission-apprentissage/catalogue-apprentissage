export type CommonStatus = "hors périmètre" | "publié" | "non publié" | "à publier" | "en attente de publication";

export type ParcoursupStatus =
  | CommonStatus
  | "à publier (vérifier accès direct postbac)"
  | "à publier (soumis à validation Recteur)"
  | "à publier (sous condition habilitation)"
  | "rejet de publication";

export type AffelnetStatus = CommonStatus | "à publier (soumis à validation)";
