const bcnNMefSchema = {
  MEF: {
    index: true,
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DISPOSITIF_FORMATION: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  FORMATION_DIPLOME: {
    index: true,
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DUREE_DISPOSITIF: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  ANNEE_DISPOSITIF: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  LIBELLE_COURT: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  LIBELLE_LONG: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DATE_OUVERTURE: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DATE_FERMETURE: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  STATUT_MEF: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  NB_OPTION_OBLIGATOIRE: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  NB_OPTION_FACULTATIF: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  RENFORCEMENT_LANGUE: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DUREE_PROJET: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DUREE_STAGE: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  HORAIRE: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  MEF_INSCRIPTION_SCOLARITE: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  MEF_STAT_11: {
    index: true,
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  MEF_STAT_9: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DATE_INTERVENTION: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  NUMERO_COMPTE: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  GESTION_DIFFUSION: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  LIBELLE_EDITION: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  ID: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  CREATED_AT: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  UPDATED_AT: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  N_COMMENTAIRE: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  created_at: {
    type: Date,
    default: Date.now,
    description: "Date d'ajout en base de données",
  },
  last_update_at: {
    type: Date,
    default: Date.now,
    description: "Date de dernières mise à jour",
  },
};
module.exports = bcnNMefSchema;
