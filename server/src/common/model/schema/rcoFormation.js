const rcoFormationsSchema = {
  id_formation: {
    type: String,
    default: null,
    description: "Identifiant de la formation",
  },
  id_action: {
    type: String,
    default: null,
    description: "Identifant des actions concaténés",
  },
  id_certifinfo: {
    type: String,
    default: null,
    description: "Identifant certifInfo (unicité de la certification)",
  },
  etablissement_gestionnaire_siret: {
    type: String,
    default: null,
    description: "Numéro de siret de l'établissement gestionnaire",
  },
  etablissement_gestionnaire_uai: {
    type: String,
    default: null,
    description: "Numéro d'UAI de l'établissement gestionnaire",
  },
  etablissement_gestionnaire_adresse: {
    type: String,
    default: null,
    description: "Adresse de l'établissement gestionnaire",
  },
  etablissement_gestionnaire_code_postal: {
    type: String,
    default: null,
    description: "Code postal de l'établissement gestionnaire",
  },
  etablissement_gestionnaire_code_insee: {
    type: String,
    default: null,
    description: "Code commune Insee de l'établissement gestionnaire",
  },
  etablissement_gestionnaire_geo_coordonnees: {
    type: String,
    implicit_type: "geo_point",
    description: "Latitude et longitude de l'établissement gestionnaire",
  },
  etablissement_formateur_siret: {
    type: String,
    default: null,
    description: "Numéro de siret de l'établissement formateur",
  },
  etablissement_formateur_uai: {
    type: String,
    default: null,
    description: "Numéro d'UAI de l'établissement formateur",
  },
  etablissement_formateur_adresse: {
    type: String,
    default: null,
    description: "Adresse de l'établissement formateur",
  },
  etablissement_formateur_code_postal: {
    type: String,
    default: null,
    description: "Code postal de l'établissement formateur",
  },
  etablissement_formateur_code_insee: {
    type: String,
    default: null,
    description: "Code commune Insee de l'établissement formateur",
  },
  etablissement_formateur_geo_coordonnees: {
    type: String,
    implicit_type: "geo_point",
    description: "Latitude et longitude de l'établissement formateur",
  },
  etablissement_lieu_formation_siret: {
    type: String,
    default: null,
    description: "Numéro de siret du lieu de formation",
  },
  etablissement_lieu_formation_uai: {
    type: String,
    default: null,
    description: "Numéro d'UAI du lieu de formation",
  },
  etablissement_lieu_formation_adresse: {
    type: String,
    default: null,
    description: "Adresse du lieu de formation",
  },
  etablissement_lieu_formation_code_postal: {
    type: String,
    default: null,
    description: "Code postal du lieu de formation",
  },
  etablissement_lieu_formation_code_insee: {
    type: String,
    default: null,
    description: "Code commune Insee du lieu de formation",
  },
  etablissement_lieu_formation_geo_coordonnees: {
    type: String,
    implicit_type: "geo_point",
    description: "Latitude et longitude du lieu de formation",
  },
  cfd: {
    type: String,
    default: null,
    description: "Code Formation Diplôme (education nationale)",
  },
  rncp_code: {
    type: String,
    default: null,
    description: "Code RNCP",
  },
  capacite: {
    type: String,
    default: null,
    description: "Capacité d'accueil",
  },
  periode: {
    type: [String],
    default: [],
    description: "Période d'inscription à la formation",
  },
  email: {
    type: String,
    default: null,
    description: "Email de contact pour cette formation",
  },
  updates_history: {
    type: [Object],
    default: [],
    description: "Historique des mises à jours",
  },
  published: {
    type: Boolean,
    default: true,
    description: "Est publiée",
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

module.exports = rcoFormationsSchema;
