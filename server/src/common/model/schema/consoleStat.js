const consoleStatSchema = {
  plateforme: {
    type: String,
    enum: ["affelnet", "parcoursup"],
    description: "Plateforme de destination",
    required: true,
  },
  date: {
    type: Date,
    default: new Date(),
    description: "Date de la statistique",
    required: true,
  },
  formations_publiees: {
    type: Number,
    default: 0,
    description: "Nombre de formations publiées à cette date et vers cette plateforme",
    required: true,
  },
  formations_integrables: {
    type: Number,
    default: 0,
    description: "Nombre de formations intégrables à cette date et vers cette plateforme",
    required: true,
  },
  organismes_avec_formations_publiees: {
    type: Number,
    default: 0,
    description: "Nombre d'organismes avec des formations publiées à cette date et vers cette plateforme",
    required: true,
  },
  organismes_avec_formations_integrables: {
    type: Number,
    default: 0,
    description: "Nombre d'organismes avec des formations intégrables à cette date et vers cette plateforme",
    required: true,
  },
};

module.exports = consoleStatSchema;
