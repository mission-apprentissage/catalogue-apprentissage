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
  parcoursup_previous_statut: {
    type: String,
    enum: Object.values(PARCOURSUP_STATUS),
    default: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
    description: "Statut parcoursup à la fin de la précédente campagne",
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
  parcoursup_statut_reinitialisation: {
    type: statutReinitialisationSchema,
    default: null,
    description: "Statut parcoursup",
  },
  parcoursup_publication_auto: {
    type: Boolean || null,
    default: null,
    description: "Parcoursup : publication auto",
  },
  parcoursup_visible: {
    type: Boolean,
    default: false,
    description: "Parcoursup : visible",
  },
};

module.exports = { parcoursupSchema };
