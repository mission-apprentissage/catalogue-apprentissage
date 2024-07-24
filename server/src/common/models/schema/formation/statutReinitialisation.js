const mongoose = require("mongoose");

const statutReinitialisationSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      default: null,
      description: "Utilisateur ayant effectué la réinitialisation",
    },
    date: {
      type: Date,
      default: null,
      description: "Date à laquelle la réinitialisation a été effectuée",
    },
    comment: {
      type: String,
      default: null,
      description: "Motif de la réinitialisation",
    },
  },
  {
    _id: false,
    timestamps: false,
  }
);

module.exports = { statutReinitialisationSchema };
