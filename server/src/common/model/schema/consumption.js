const consumptionSchema = {
  route: {
    index: true,
    type: String,
    default: null,
    description: "Nom de la route",
  },
  globalCallCount: {
    type: Number,
    default: 0,
    description: "Nombre d'appels de la route",
  },
  consumers: {
    type: [{ ip: String, callCount: Number }],
    default: [],
    description: "Consommateur de l'api",
  },
};

module.exports = consumptionSchema;
