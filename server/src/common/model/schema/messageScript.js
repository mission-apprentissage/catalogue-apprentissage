const messageScriptSchema = {
  msg: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
};
module.exports = messageScriptSchema;
