const previousSeasonFormationSchema = {
  cle_ministere_educatif: {
    index: true,
    type: String,
    description: "Clé unique de la formation (pour envoi aux ministères éducatifs)",
    required: true,
  },
  num_academie: {
    index: true,
    type: String,
    description: "Numéro de l'académie",
    required: true,
  },
  parcoursup_perimetre: {
    type: Boolean,
    default: false,
    description: "Dans le périmètre parcoursup",
  },
  parcoursup_statut: {
    type: String,
    enum: [
      "hors périmètre",
      "publié",
      "non publié",
      "à publier (sous condition habilitation)",
      "à publier (vérifier accès direct postbac)",
      "à publier (soumis à validation Recteur)",
      "à publier",
      "en attente de publication",
      "rejet de publication",
    ],
    default: "hors périmètre",
    description: "Statut parcoursup",
  },
  affelnet_perimetre: {
    type: Boolean,
    default: false,
    description: "Dans le périmètre affelnet",
  },
  affelnet_statut: {
    type: String,
    enum: [
      "hors périmètre",
      "publié",
      "non publié",
      "à publier (soumis à validation)",
      "à publier sous réserve (Bac pro de 3 ans en 2 ans)",
      "à publier",
      "en attente de publication",
    ],
    default: "hors périmètre",
    description: "Statut affelnet",
  },
};

module.exports = previousSeasonFormationSchema;
