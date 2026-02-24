const { Schema, model } = require("mongoose");

const historySchema = new Schema(
  {
    collectionName: String,
    collectionId: Schema.Types.ObjectId,
    diff: {},
    user: {},
    reason: String,
    version: { type: Number, min: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = { model: model("History", historySchema) };
