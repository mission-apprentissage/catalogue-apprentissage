const mongoose = require("mongoose");

const certificateurSchema = new mongoose.Schema(
  {
    certificateur: {
      type: String,
    },
    siret_certificateur: {
      type: String,
    },
  },
  { _id: false }
);

module.exports = { certificateurSchema };
