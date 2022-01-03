const reportSchema = {
  type: {
    index: true,
    type: String,
    default: null,
    description: "Type du rapport",
  },
  date: {
    index: true,
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
  uuid: {
    index: true,
    type: String,
    default: null,
    description: "uuid across report",
  },
};

module.exports = reportSchema;
