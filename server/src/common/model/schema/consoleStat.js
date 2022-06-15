const mongoose = require("mongoose");

const { academies } = require("../../../constants/academies");

const keys = ["Toute la France", ...Object.values(academies).map((academie) => academie.nom_academie)];

const academieStatSchema = new mongoose.Schema({
  academie: {
    type: String,
    default: "Toute la France",
  },
  formations_publiees: {
    type: Number,
    default: 0,
  },
  formations_integrables: {
    type: Number,
    default: 0,
  },
  organismes_avec_formations_publiees: {
    type: Number,
    default: 0,
  },
  organismes_avec_formations_integrables: {
    type: Number,
    default: 0,
  },
  details: {
    type: Object,
    default: {},
  },
});

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
  stats: {
    type: [academieStatSchema],
    default: [],
    description: "Statistiques propre à chaque académie, ainsi qu'à toute la France",
  },
};

keys.reduce(function (result, current) {
  return Object.assign(result, { [current]: academieStatSchema });
}, consoleStatSchema);

module.exports = consoleStatSchema;
