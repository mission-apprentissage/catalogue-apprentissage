const mongoose = require("mongoose");

const modaliteSchema = new mongoose.Schema(
  {
    duree: String,
    annee: String,
  },
  { _id: false }
);

module.exports = { modaliteSchema };
