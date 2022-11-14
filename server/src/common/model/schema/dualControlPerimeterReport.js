const dualControlPerimeterReportSchema = {
  plateforme: {
    type: String,
    enum: ["affelnet", "parcoursup"],
    description: "Plateforme de destination",
    required: true,
  },
  date: {
    index: true,
    type: Date,
    default: new Date(),
    expires: "1y", // mongo will auto-remove data after 1 year
    description: "Date du rapport",
    required: true,
  },
  statuts: {
    type: Object,
    default: {},
    description: "Liste des statuts avec le nombre de formations correspondant",
  },
};

module.exports = dualControlPerimeterReportSchema;
