const { compose } = require("oleoduc");

module.exports = {
  sendJsonStream: (stream, res) => {
    res.setHeader("Content-Type", "application/json");
    compose(stream, res);
  },
};
