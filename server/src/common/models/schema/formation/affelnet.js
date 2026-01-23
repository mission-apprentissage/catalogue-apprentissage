const mongoose = require("mongoose");
const { AFFELNET_STATUS } = require("../../../../constants/status");
const { mefSchema } = require("./mef");
const { statutReinitialisationSchema } = require("./statutReinitialisation");

const affelnetSchema = {
  affelnet_perimetre: {
    type: Boolean,
    default: false,
    description: "Dans le périmètre Affelnet",
  },
  affelnet_session: {
    type: Boolean,
    default: false,
    description: "Possède une date de début durant la prochaine session Affelnet",
  },
  affelnet_previous_session: {
    type: Boolean,
    default: false,
    description: "Possède une date de début durant la précédente session Affelnet",
  },
  affelnet_statut: {
    type: String,
    enum: Object.values(AFFELNET_STATUS),
    default: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
    description: "Statut affelnet",
  },
  affelnet_statut_initial: {
    type: String,
    enum: Object.values(AFFELNET_STATUS),
    default: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
    description: "Statut initial affelnet",
  },
  affelnet_statut_a_definir: {
    type: Boolean,
    default: false,
    description: "Est-ce que la formation appartient au périmètre grâce à une règle académique ?",
  },
  affelnet_previous_statut: {
    type: String,
    enum: Object.values(AFFELNET_STATUS),
    default: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
    description: "Statut affelnet à la fin de la précédente campagne",
  },
  affelnet_last_statut: {
    type: String,
    enum: Object.values(AFFELNET_STATUS),
    default: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
    description: "Statut affelnet avant éxécution des règles de périmètre",
  },
  affelnet_statut_history: {
    type: [Object],
    default: [],
    description: "Affelnet : historique des statuts",
    noIndex: true,
  },
  affelnet_id: {
    index: true,
    type: String,
    default: null,
    description: "identifiant Affelnet de la formation (code vœu)",
  },
  affelnet_published_date: {
    type: Date,
    default: null,
    description: 'Date de publication (passage au statut "publié")',
  },
  affelnet_infos_offre: {
    type: String,
    default: null,
    description: "Affelnet : Informations offre de formation",
  },
  affelnet_url_infos_offre: {
    type: String,
    default: null,
    description: "Affelnet : Libellé ressource complémentaire",
  },
  affelnet_modalites_offre: {
    type: String,
    default: null,
    description: "Affelnet : Modalités particulières",
  },
  affelnet_url_modalites_offre: {
    type: String,
    default: null,
    description: "Affelnet : Lien vers la ressource",
  },
  affelnet_code_nature: {
    type: String,
    default: null,
    description: "Affelnet : code nature de l'établissement de formation",
  },
  affelnet_secteur: {
    type: String,
    enum: ["PR", "PU", null],
    default: null,
    description: "Affelnet : type d'établissement (PR: Privé / PU: Public)",
  },
  affelnet_raison_depublication: {
    type: String,
    default: null,
    description: "Affelnet : raison de dépublication",
  },
  affelnet_raison_depublication_precision: {
    type: String,
    default: null,
    description: "Affelnet : raison de dépublication (précision)",
  },
  affelnet_raison_depublication_tag: {
    type: String,
    default: null,
    description: "Affelnet : raison de dépublication (catégorie)",
  },

  affelnet_mefs_10: {
    type: [mefSchema],
    default: [],
    description: "Tableau de Code MEF 10 caractères et modalités (filtrés pour Affelnet si applicable)",
  },
  affelnet_mefs_10_agregat: {
    type: [String],
    default: [],
    description: "Tableau de Code MEF 10 caractères (filtrés pour Affelnet si applicable) (agrégat pour recherche)",
  },
  affelnet_publication_auto: {
    type: Boolean || null,
    default: null,
    description: "Affelnet : publication auto",
  },
  affelnet_perimetre_prise_rdv: {
    type: Boolean,
    default: false,
    description: "Affelnet : visible",
  },

  // CANDIDATURES
  affelnet_candidature_status: {
    type: String,
    default: null,
    description: "Statut de téléchargement des candidatures Affelnet",
  },
};

module.exports = { affelnetSchema };
