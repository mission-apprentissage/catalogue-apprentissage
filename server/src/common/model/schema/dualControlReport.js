const dualControlReportSchema = {
  discriminator: {
    type: String,
    default: null,
    description: "Un discriminant à des fin de filtrage des rapports",
  },
  date: {
    index: true,
    type: Date,
    default: Date.now,
    expires: "1y", // mongo will auto-remove data after 1 year
    description: "Date du rapport",
    required: true,
  },
  totalFormation: {
    type: Number,
    default: 0,
    description: "Nombre total de formations dans le catalogue",
    required: true,
  },
  totalDualControlFormation: {
    type: Number,
    default: 0,
    description: "Nombre total de formations dans le nouveau flux",
    required: true,
  },
  totalFormationWithUnpublished: {
    type: Number,
    default: 0,
    description: "Nombre total de formations dans le catalogue, incluant les non-publiées",
    required: true,
  },
  totalDualControlFormationWithUnpublished: {
    type: Number,
    default: 0,
    description: "Nombre total de formations dans le nouveau flux, incluant les non-publiées",
    required: true,
  },
  totalNotFound: {
    type: Number,
    default: 0,
    description: "Nombre de formations dans le nouveau flux qui n'existe pas dans le catalogue",
  },
  fields: {
    type: Object,
    default: {},
    description: "Liste des champs avec le nombre d'écarts constatés par champ (clé: valeur)",
  },
};

module.exports = dualControlReportSchema;
