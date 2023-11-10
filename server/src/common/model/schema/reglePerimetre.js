const { COMMON_STATUS, PARCOURSUP_STATUS, AFFELNET_STATUS } = require("../../../constants/status");

const reglePerimetre = {
  plateforme: {
    index: true,
    type: String,
    enum: ["affelnet", "parcoursup"],
    default: "affelnet",
    description: "Plateforme pour laquelle s'applique la règle",
    required: true,
  },
  niveau: {
    index: true,
    type: String,
    enum: ["3 (CAP...)", "4 (BAC...)", "5 (BTS, DEUST...)", "6 (Licence, BUT...)", "7 (Master, titre ingénieur...)"],
    default: "3 (CAP...)",
    description: "Niveau sur lequel s'applique la règle",
    required: true,
  },
  diplome: {
    index: true,
    type: String,
    default: null,
    description: "Diplôme sur lequel s'applique la règle",
    required: true,
  },
  statut: {
    index: true,
    type: String,
    enum: [
      ...new Set([
        ...Object.values(PARCOURSUP_STATUS).filter(
          (value) => ![PARCOURSUP_STATUS.FERME, PARCOURSUP_STATUS.REJETE].includes(value)
        ),
        ...Object.values(AFFELNET_STATUS),
      ]),
    ],
    default: COMMON_STATUS.NON_PUBLIABLE_EN_LETAT,
    description: "Statut appliqué quand la formation matche la règle",
    required: true,
  },
  num_academie: {
    index: true,
    type: Number,
    default: 0,
    description: "Académie pour laquelle la règle a été créé si il y en a une",
  },
  statut_academies: {
    type: Object,
    default: {},
    description: "Les statuts à appliquer pour cette règle en académies",
  },
  regle_complementaire: {
    type: String,
    default: null,
    description:
      "La règle pour matcher les formations (i.e: query mongo) qui s'ajoute au niveau + diplome (stringified)",
  },
  regle_complementaire_query: {
    type: String,
    default: null,
    description: "La règle complémentaire, de type eS pour le rule builder",
  },
  nom_regle_complementaire: {
    index: true,
    type: String,
    default: null,
    description: "Nom du sous-ensemble",
  },
  priorite: {
    type: Number,
    default: 0,
    description:
      "En cas d'égalité sur la plateforme, niveau et diplome, priorité de la règle pour savoir laquelle est la plus forte",
  },
  // history
  updates_history: {
    type: [Object],
    default: [],
    description: "Historique des mises à jours",
  },
  last_update_at: {
    type: Date,
    default: Date.now,
    description: "Date de dernière mise à jour",
  },
  last_update_who: {
    type: String,
    default: null,
    description: "Qui a réalisé la dernière modification",
  },
  is_deleted: {
    index: true,
    type: Boolean,
    default: false,
    description: "True si la règle a été supprimée (soft delete)",
  },
  condition_integration: {
    index: true,
    type: String,
    enum: ["doit intégrer", "peut intégrer", "ne doit pas intégrer"],
    default: "peut intégrer",
    description: "Condition d'intégration dans la plateforme",
    required: true,
  },
  duree: {
    index: true,
    type: String,
    default: null,
    description: "Durée en années pour matcher les formations",
  },
  annee: {
    index: true,
    type: String,
    default: null,
    description: "Année d'inscription de la formation",
  },
};
module.exports = reglePerimetre;
