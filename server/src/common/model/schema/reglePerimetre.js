const reglePerimetre = {
  plateforme: {
    type: String,
    enum: ["affelnet", "parcoursup"],
    default: "affelnet",
    description: "Plateforme pour laquelle s'applique la règle",
    required: true,
  },
  niveau: {
    type: String,
    enum: ["3 (CAP...)", "4 (BAC...)", "5 (BTS, DEUST...)", "6 (Licence, BUT...)", "7 (Master, titre ingénieur...)"],
    default: "3 (CAP...)",
    description: "Niveau sur lequel s'applique la règle",
    required: true,
  },
  diplome: {
    type: String,
    default: null,
    description: "Diplôme sur lequel s'applique la règle",
    required: true,
  },
  statut: {
    type: String,
    enum: [
      "hors périmètre",
      "publié",
      "non publié",
      "à publier (vérifier accès direct postbac)",
      "à publier (soumis à validation Recteur)",
      "à publier (soumis à validation)",
      "à publier",
      "en attente de publication",
    ],
    default: "hors périmètre",
    description: "Statut appliqué quand la formation matche la règle",
    required: true,
  },
  num_academie: {
    type: Number,
    default: 0,
    description: "Académie sur laquelle la règle s'applique, toutes par défaut",
  },
  regle_complementaire: {
    type: String,
    default: null,
    description:
      "La règle pour matcher les formations (i.e: query mongo) qui s'ajoute au niveau + diplome (stringified)",
  },
  nom_regle_complementaire: {
    type: String,
    default: null,
    description: "Nom du sous-ensemble",
  },
  priorite: {
    type: Number,
    default: 0,
    description:
      "En cas d'égalité sur la plateforme, niveau, diplome et num_academie, priorité de la règle pour savoir laquelle est la plus forte",
  },
  is_regle_nationale: {
    type: Boolean,
    default: true,
    description: "True si la règle est une règle nationale (définie dans les textes de loi)",
  },
  // history
  created_at: {
    type: Date,
    default: Date.now,
    description: "Date d'ajout en base de données",
  },
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
};
module.exports = reglePerimetre;
