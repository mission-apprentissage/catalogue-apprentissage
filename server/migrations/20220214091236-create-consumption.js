const { Consumption } = require("../src/common/model");

module.exports = {
  async up() {
    console.log("Creating Consumption collection");
    Consumption.createCollection();
  },

  async down() {
    console.log("Droping Consumption collection");
    Consumption.dropCollection();
  },
};
