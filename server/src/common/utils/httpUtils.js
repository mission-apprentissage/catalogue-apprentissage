const { compose } = require("oleoduc");

module.exports = {
  sendJsonStream: (stream, res) => {
    res.setHeader("Content-Type", "application/json");
    compose(stream, res);
  },

  sendCsvStream: (stream, res) => {
    res.setHeader("Content-Type", "text/csv");
    compose(stream, res);
  },
};
