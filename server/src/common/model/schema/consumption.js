const mongoose = require("mongoose");

const consumerSchema = new mongoose.Schema(
  {
    caller: String,
    callCount: Number,
    date: String,
  },
  { _id: false }
);

const consumptionSchema = {
  path: {
    index: true,
    type: String,
    default: null,
    description: "Chemin d'appel",
  },
  method: {
    index: true,
    type: String,
    default: null,
    description: "Method d'appel",
  },
  globalCallCount: {
    type: Number,
    default: 0,
    description: "Nombre d'appels de la route",
  },
  consumers: {
    type: [consumerSchema],
    default: [],
    description: "Consommateur de l'api",
  },
};

module.exports = consumptionSchema;
