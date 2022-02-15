const statistiqueSchema = {
  source: {
    index: true,
    type: String,
    default: null,
    description: "Source d'origine de la statistique",
    required: true,
  },
  count: {
    type: Number,
    default: 0,
    description: "Compteur",
  },
};

module.exports = statistiqueSchema;
