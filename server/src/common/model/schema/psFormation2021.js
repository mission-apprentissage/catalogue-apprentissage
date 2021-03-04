const psFormation2020Schema = require("./psFormation");

const psFormation2021Schema = {
  ...psFormation2020Schema,
  id_parcoursup: {
    type: String,
    default: null,
    description: "identifiant unique de la formation côté parcoursup (CODEFORMATIONINSCRIPTION)",
  },
  uai_cerfa: {
    type: String,
    default: null,
    description: "uai renseigné sur la fiche CERFA",
  },
  uai_insert_jeune: {
    type: String,
    default: null,
    description: "uai insert jeune",
  },
  uai_map: {
    type: String,
    default: null,
    description: "uai",
  },
  siret_cerfa: {
    type: String,
    default: null,
    description: "siret renseigné sur la fiche CERFA",
  },
  siret_map: {
    type: String,
    default: null,
    description: "siret",
  },
};

module.exports = psFormation2021Schema;
