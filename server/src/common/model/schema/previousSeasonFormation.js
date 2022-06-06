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
  plateforme: {
    index: true,
    type: String,
    enum: ["affelnet", "parcoursup"],
    description: "Plateforme pour laquelle la formation était dans le périmètre",
    required: true,
  },
};

module.exports = previousSeasonFormationSchema;
