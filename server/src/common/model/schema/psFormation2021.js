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
  codediplome_map: {
    type: String,
    default: null,
    description: "cfd map",
  },
  code_formation_inscription: {
    type: String,
    default: null,
    description: "CODEFORMATIONINSCRIPTION",
  },
  code_formation_accueil: {
    type: String,
    default: null,
    description: "CODEFORMATIONACCUEIL",
  },
  latitude: {
    type: String,
    default: null,
    description: "LATITUDE",
  },
  longitude: {
    type: String,
    default: null,
    description: "LONGITUDE",
  },
  complement_adresse: {
    type: String,
    default: null,
    description: "COMPLEMENTADRESSE",
  },
  complement_adresse_1: {
    type: String,
    default: null,
    description: "COMPLEMENTADRESSE1",
  },
  complement_adresse_2: {
    type: String,
    default: null,
    description: "COMPLEMENTADRESSE2",
  },
  complement_code_postal: {
    type: String,
    default: null,
    description: "COMPLEMENTCODEPOSTAL",
  },
  complement_commune: {
    type: String,
    default: null,
    description: "COMPLEMENTCOMMUNE",
  },
  libelle_insert_jeune: {
    type: String,
    default: null,
    description: "LIB_INS",
  },
  complement_cedex: {
    type: String,
    default: null,
    description: "COMPLEMENTCEDEX",
  },
  codes_cfd_mna: {
    type: [String],
    default: null,
    description: "CODE_CFD_MNA",
  },
  codes_rncp_mna: {
    type: [String],
    default: null,
    description: "CODE_RNCP_MNA",
  },
  codes_romes_mna: {
    type: [String],
    default: null,
    description: "CODE_ROMES_MNA",
  },
  type_rapprochement_mna: {
    type: String,
    default: null,
    description: "TYPE_RAPPROCHEMENT_MNA",
  },
};

module.exports = psFormation2021Schema;
