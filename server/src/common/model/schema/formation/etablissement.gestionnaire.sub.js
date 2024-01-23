const etablissementGestionnaireInfo = {
  etablissement_gestionnaire_id: {
    type: String,
    default: null,
    description: "Identifiant établissement gestionnaire",
  },
  etablissement_gestionnaire_siret: {
    index: true,
    type: String,
    default: null,
    description: "Numéro siret gestionnaire",
  },
  etablissement_gestionnaire_enseigne: {
    type: String,
    default: null,
    description: "Enseigne établissement gestionnaire",
  },
  etablissement_gestionnaire_uai: {
    index: true,
    type: String,
    default: null,
    description: "UAI de l'etablissement gestionnaire",
  },
  etablissement_gestionnaire_published: {
    type: Boolean,
    default: false,
    description: "Etablissement gestionnaire est publié",
  },
  etablissement_gestionnaire_habilite_rncp: {
    type: Boolean,
    default: false,
    description: "Etablissement gestionnaire est habilité RNCP ou pas",
  },
  etablissement_gestionnaire_certifie_qualite: {
    type: Boolean,
    default: false,
    description: "Etablissement gestionnaire est certifié Qualité",
  },
  etablissement_gestionnaire_adresse: {
    type: String,
    default: null,
    description: "Numéro et rue établissement gestionnaire",
  },
  etablissement_gestionnaire_code_postal: {
    type: String,
    default: null,
    description: "Code postal établissement gestionnaire",
  },
  etablissement_gestionnaire_code_commune_insee: {
    type: String,
    default: null,
    description: "Code commune insee établissement gestionnaire",
  },
  etablissement_gestionnaire_localite: {
    type: String,
    default: null,
    description: "Localité établissement gestionnaire",
  },
  etablissement_gestionnaire_complement_adresse: {
    type: String,
    default: null,
    description: "Complément d'adresse de l'établissement gestionnaire",
  },
  etablissement_gestionnaire_cedex: {
    type: String,
    default: null,
    description: "Cedex",
  },
  etablissement_gestionnaire_entreprise_raison_sociale: {
    type: String,
    default: null,
    description: "Raison sociale établissement gestionnaire",
  },
  geo_coordonnees_etablissement_gestionnaire: {
    type: String,
    implicit_type: "geo_point",
    description: "Latitude et longitude de l'établissement gestionnaire",
  },
  etablissement_gestionnaire_region: {
    type: String,
    default: null,
    description: "région gestionnaire",
  },

  etablissement_gestionnaire_num_departement: {
    type: String,
    default: null,
    description: "Numéro de departement gestionnaire",
  },
  etablissement_gestionnaire_nom_departement: {
    type: String,
    default: null,
    description: "Nom du departement gestionnaire",
  },
  etablissement_gestionnaire_nom_academie: {
    type: String,
    default: null,
    description: "Nom de l'académie gestionnaire",
  },
  etablissement_gestionnaire_num_academie: {
    type: String,
    default: "0",
    description: "Numéro de l'académie gestionnaire",
  },
  etablissement_gestionnaire_siren: {
    type: String,
    default: null,
    description: "Numéro siren gestionnaire",
  },
  etablissement_gestionnaire_nda: {
    type: String,
    default: null,
    description: "Numéro Déclaration gestionnaire",
  },
  etablissement_gestionnaire_date_creation: {
    type: Date,
    default: null,
    description: "Date de création de l'établissement",
  },
  etablissement_gestionnaire_courriel: {
    noIndex: true,
    type: String,
    default: null,
    description: "Adresse email de contact de l'établissement gestionnaire",
  },
  etablissement_gestionnaire_actif: {
    type: String,
    default: null,
    description: "SIRET actif ou inactif pour l'établissement gestionnaire",
  },
};

module.exports = etablissementGestionnaireInfo;
