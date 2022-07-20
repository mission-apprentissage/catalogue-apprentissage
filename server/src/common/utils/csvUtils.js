const { parse } = require("csv-parse");
const { DateTime } = require("luxon");

function parseCsv(options = {}) {
  return parse({
    delimiter: ";",
    trim: true,
    columns: true,
    ...options,
  });
}

function date(v) {
  return v ? DateTime.fromJSDate(v).toLocaleString() : "";
}

function ouiNon(v) {
  return v ? "Oui" : "Non";
}

module.exports = {
  parseCsv,
  ouiNon,
  date,
};
