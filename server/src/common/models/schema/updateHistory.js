const { default: mongoose } = require("mongoose");

const updateHistorySchema = new mongoose.Schema(
  {
    from: {
      type: Object,
      default: {},
      description: "Valeurs avant mise à jour",
    },
    to: {
      type: Object,
      default: {},
      description: "Valeurs après mise à jour",
    },
  },
  {
    _id: false,
    timestamps: {
      createdAt: false,
      updatedAt: "updated_at",
    },
  }
);

module.exports = { updateHistorySchema };
