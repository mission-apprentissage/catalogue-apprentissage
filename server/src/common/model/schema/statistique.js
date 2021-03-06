const statistiqueSchema = {
  source: {
    type: String,
    default: null,
    description: "Source d'origine de la statistique",
  },
  id_rco_formation: {
    type: String,
    description: "Identifiant unique RCO de la formation",
  },
  date: {
    type: Date,
    description: "Date de l'évènement",
  },
};

module.exports = statistiqueSchema;
