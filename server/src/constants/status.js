// @ts-check
/** @typedef {"non intégrable" | "publié" | "non publié" | "à publier" | "en attente de publication"} CommonStatus */
/** @typedef {CommonStatus | "à publier (vérifier accès direct postbac)" | "à publier (soumis à validation Recteur)" | "à publier (sous condition habilitation)" | "rejet de publication"} ParcoursupStatus */
/** @typedef {CommonStatus|  "à publier (soumis à validation)"} AffelnetStatus */

const COMMON_STATUS = {
  NON_INTEGRABLE: /** @type {CommonStatus} */ ("non intégrable"),
  PUBLIE: /** @type {CommonStatus} */ ("publié"),
  NON_PUBLIE: /** @type {CommonStatus} */ ("non publié"),
  A_PUBLIER: /** @type {CommonStatus} */ ("à publier"),
  EN_ATTENTE: /** @type {CommonStatus} */ ("en attente de publication"),
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
