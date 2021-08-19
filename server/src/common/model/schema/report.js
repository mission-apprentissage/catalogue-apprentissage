const reportSchema = {
  type: {
    type: String,
    default: null,
    description: "Type du rapport",
  },
  date: {
    type: Date,
    default: Date.now,
    expires: "15d", // mongo will auto-remove data after 15 days
    description: "Date du rapport",
  },
  data: {
    type: Object,
    default: {},
    description: "Données du rapport",
  },
};

module.exports = reportSchema;
