const mongoose = require("mongoose");
const { PARCOURSUP_STATUS } = require("../../../../constants/status");
const { mefSchema } = require("./mef");
const { statutReinitialisationSchema } = require("./statutReinitialisation");

const parcoursupSchema = {
  parcoursup_perimetre: {
    type: Boolean,
    default: false,
    description: "Dans le périmètre parcoursup",
  },
  parcoursup_session: {
    type: Boolean,
    default: false,
    description: "Possède une date de début durant la prochaine session Parcoursup",
  },
  parcoursup_previous_session: {
    type: Boolean,
    default: false,
    description: "Possède une date de début durant la précédente session Parcoursup",
  },
  parcoursup_statut: {
    type: String,
    enum: Object.values(PARCOURSUP_STATUS),
    default: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
    description: "Statut parcoursup",
  },
  parcoursup_statut_initial: {
    type: String,
    enum: Object.values(PARCOURSUP_STATUS),
    default: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
    description: "Statut initial parcoursup",
  },
  parcoursup_previous_statut: {
    type: String,
    enum: Object.values(PARCOURSUP_STATUS),
    default: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
    description: "Statut parcoursup à la fin de la précédente campagne",
  },
  parcoursup_last_statut: {
    type: String,
    enum: Object.values(PARCOURSUP_STATUS),
    default: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
    description: "Statut parcoursup avant éxécution des règles de périmètre",
  },
  parcoursup_statut_history: {
    type: [Object],
    default: [],
    description: "Parcoursup : historique des statuts",
    noIndex: true,
  },
  parcoursup_error: {
    type: String,
    default: null,
    description: "Erreur lors de la création de la formation sur ParcourSup (via le WS)",
  },
  parcoursup_id: {
    index: true,
    type: String,
    default: null,
    description: "identifiant Parcoursup de la formation (g_ta_cod)",
  },
  parcoursup_published_date: {
    type: Date,
    default: null,
    description: 'Date de publication (passage au statut "publié")',
  },
  parcoursup_published: {
    type: Boolean,
    default: null,
    description: "Publié sur le moteur de recherche Parcoursup",
  },
  parcoursup_export_date: {
    type: Date,
    default: null,
    description: "Date de la dernière tentative d'export vers Parcoursup",
  },
  parcoursup_raison_depublication: {
    type: String,
    default: null,
    description: "Parcoursup : raison de dépublication",
  },
  parcoursup_mefs_10: {
    type: [mefSchema],
    default: [],
    description: "Tableau de Code MEF 10 caractères et modalités (filtrés pour Parcoursup si applicable)",
  },
  parcoursup_mefs_10_agregat: {
    type: [String],
    default: [],
    description: "Tableau de Code MEF 10 caractères (filtrés pour Parcoursup si applicable) (agrégat pour recherche)",
  },
  parcoursup_statut_reinitialisation: {
    type: statutReinitialisationSchema,
    default: null,
    description: "Parcoursup: Statut de réinitialisation forcée",
  },
  parcoursup_publication_auto: {
    type: Boolean || null,
    default: null,
    description: "Parcoursup: publication auto",
  },
  parcoursup_perimetre_prise_rdv: {
    type: Boolean,
    default: false,
    description: "Parcoursup : visible",
  },
};

module.exports = { parcoursupSchema };
