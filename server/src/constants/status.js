// @ts-check
/** @typedef {"non publiable en l'état" | "publié" | "non publié" | "à publier" | "prêt pour intégration"} CommonStatus */
/** @typedef {CommonStatus | "à publier (vérifier accès direct postbac)" | "à publier (soumis à validation Recteur)" | "à publier (sous condition habilitation)" | "rejet de publication"} ParcoursupStatus */
/** @typedef {CommonStatus|  "à publier (soumis à validation)"} AffelnetStatus */

const COMMON_STATUS = {
  NON_PUBLIABLE_EN_LETAT: /** @type {CommonStatus} */ ("non publiable en l'état"),
  PUBLIE: /** @type {CommonStatus} */ ("publié"),
  NON_PUBLIE: /** @type {CommonStatus} */ ("non publié"),
  A_PUBLIER: /** @type {CommonStatus} */ ("à publier"),
  PRET_POUR_INTEGRATION: /** @type {CommonStatus} */ ("prêt pour intégration"),
};

const PARCOURSUP_STATUS = {
  ...COMMON_STATUS,
  A_PUBLIER_VERIFIER_POSTBAC: /** @type {ParcoursupStatus} */ ("à publier (vérifier accès direct postbac)"),
  A_PUBLIER_VALIDATION_RECTEUR: /** @type {ParcoursupStatus} */ ("à publier (soumis à validation Recteur)"),
  A_PUBLIER_HABILITATION: /** @type {ParcoursupStatus} */ ("à publier (sous condition habilitation)"),
  REJETE: /** @type {ParcoursupStatus} */ ("rejet de publication"),
  FERME: /** @type {ParcoursupStatus} */ ("fermé"),
};

const AFFELNET_STATUS = {
  ...COMMON_STATUS,
  A_PUBLIER_VALIDATION: /** @type {AffelnetStatus} */ ("à publier (soumis à validation)"),
};

module.exports = {
  COMMON_STATUS,
  PARCOURSUP_STATUS,
  AFFELNET_STATUS,
};
