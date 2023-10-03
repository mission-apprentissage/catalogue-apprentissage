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
  },
  { _id: false }
);

module.exports = { mefSchema };
