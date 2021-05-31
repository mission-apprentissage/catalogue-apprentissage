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
    required: false,
  },
};
module.exports = messageScriptSchema;
