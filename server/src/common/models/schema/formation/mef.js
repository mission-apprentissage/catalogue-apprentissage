const mongoose = require("mongoose");
const { modaliteSchema } = require("./modalite");

const mefSchema = new mongoose.Schema(
  {
    mef10: {
      index: true,
      type: String,
    },
    modalite: {
      type: modaliteSchema,
    },
    date_fermeture: {
      type: Date,
      default: null,
    },
    mef_outdated: {
      type: Boolean,
      default: false,
      description: "MEF périmé (fermeture avant le 31 août de l'année courante)",
    },
  },
  { _id: false }
);

module.exports = { mefSchema };
