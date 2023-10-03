const mongoose = require("mongoose");

const partenaireSchema = new mongoose.Schema(
  {
    Nom_Partenaire: {
      type: String,
    },
    Siret_Partenaire: {
      type: String,
    },
    Habilitation_Partenaire: {
      type: String,
    },
  },
  { _id: false }
);

module.exports = { partenaireSchema };
