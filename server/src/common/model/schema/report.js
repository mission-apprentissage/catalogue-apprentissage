const reportSchema = {
  type: {
    type: String,
    default: null,
    description: "Type du rapport",
  },
  date: {
    type: Date,
    default: Date.now,
    description: "Date du rapport",
  },
  data: {
    type: Object,
    default: {},
    description: "Données du rapport",
  },
};

module.exports = reportSchema;
