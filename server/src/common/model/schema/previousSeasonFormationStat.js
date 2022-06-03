const previousSeasonFormationStatSchema = {
  plateforme: {
    index: true,
    type: String,
    enum: ["affelnet", "parcoursup"],
    description: "Plateforme pour laquelle la formation était dans le périmètre",
    required: true,
  },
  date: {
    type: Date,
    default: new Date(),
    description: "Date de la statistique",
    required: true,
  },
  vanishing_scope_causes: {
    type: Object,
    description: "Causes de disparition du périmètre par académie",
    required: true,
  },
};

module.exports = previousSeasonFormationStatSchema;
