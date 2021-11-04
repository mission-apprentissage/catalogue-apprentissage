const faker = require("faker");
const { merge } = require("lodash");
const { Etablissement } = require("../../src/common/model");

module.exports = {
  models: {
    Sample: {
      nom: "TEST",
      valeur: "Valeur",
    },
  },
  insertEtablissement(custom) {
    return Etablissement.create(
      merge(
        {},
        {
          siret: faker.helpers.replaceSymbols("#########00015"),

          uai: "0010856A",
          tags: ["2020", "2021"],
        },
        custom
      )
    );
  },
};
