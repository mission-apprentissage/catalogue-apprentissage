const { PARCOURSUP_STATUS, AFFELNET_STATUS } = require("../../../constants/status");

const previousSeasonFormationSchema = {
  cle_ministere_educatif: {
    index: true,
    type: String,
    description: "Clé unique de la formation (pour envoi aux ministères éducatifs)",
    required: true,
  },
  num_academie: {
    index: true,
    type: String,
    description: "Numéro de l'académie",
    required: true,
  },
  parcoursup_perimetre: {
    type: Boolean,
    default: false,
    description: "Dans le périmètre parcoursup",
  },
  parcoursup_statut: {
    type: String,
    enum: Object.values(PARCOURSUP_STATUS),
    default: PARCOURSUP_STATUS.NON_INTEGRABLE,
    description: "Statut parcoursup",
  },
  affelnet_perimetre: {
    type: Boolean,
    default: false,
    description: "Dans le périmètre affelnet",
  },
  affelnet_statut: {
    type: String,
    enum: Object.values(AFFELNET_STATUS),
    default: AFFELNET_STATUS.NON_INTEGRABLE,
    description: "Statut affelnet",
  },
};

module.exports = previousSeasonFormationSchema;
