const mongoose = require("mongoose");

const romeSchema = new mongoose.Schema(
  {
    rome: {
      type: String,
    },
    libelle: {
      type: String,
    },
  },
  { _id: false }
);

module.exports = { romeSchema };
