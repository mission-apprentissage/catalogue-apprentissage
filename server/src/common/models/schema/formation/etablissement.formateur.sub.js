const etablissementFormateurInfo = {
  etablissement_formateur_id: {
    type: String,
    default: null,
    description: "Identifiant établissement formateur",
  },
  etablissement_formateur_siret: {
    index: true,
    type: String,
    default: null,
    description: "Numéro siret formateur",
  },
  etablissement_formateur_enseigne: {
    type: String,
    default: null,
    description: "Enseigne établissement formateur",
  },
  etablissement_formateur_uai: {
    index: true,
    type: String,
    default: null,
    description: "UAI de l'etablissement formateur",
  },
  etablissement_formateur_published: {
    type: Boolean,
    default: false,
    description: "Etablissement formateur est publié",
  },
  etablissement_formateur_habilite_rncp: {
    type: Boolean,
    default: false,
    description: "Etablissement formateur est habilité RNCP ou pas",
  },
  etablissement_formateur_certifie_qualite: {
    type: Boolean,
    default: false,
    description: "Etablissement formateur est certifié Qualité",
  },
  etablissement_formateur_adresse: {
    type: String,
    default: null,
    description: "Numéro et rue établissement formateur",
  },
  etablissement_formateur_code_postal: {
    type: String,
    default: null,
    description: "Code postal établissement formateur",
  },
  etablissement_formateur_code_commune_insee: {
    type: String,
    default: null,
    description: "Code commune insee établissement formateur",
  },
  etablissement_formateur_localite: {
    type: String,
    default: null,
    description: "Localité établissement formateur",
  },
  etablissement_formateur_complement_adresse: {
    type: String,
    default: null,
    description: "Complément d'adresse de l'établissement",
  },
  etablissement_formateur_cedex: {
    type: String,
    default: null,
    description: "Cedex",
  },
  etablissement_formateur_entreprise_raison_sociale: {
    type: String,
    default: null,
    description: "Raison sociale établissement formateur",
  },
  etablissement_formateur_raison_sociale_enseigne: {
    type: String,
    default: null,
    description: "Raison sociale et enseigne de l'établissement formateur",
  },
  geo_coordonnees_etablissement_formateur: {
    type: String,
    implicit_type: "geo_point",
    description: "Latitude et longitude de l'établissement formateur",
  },

  etablissement_formateur_region: {
    type: String,
    default: null,
    description: "région formateur",
  },

  etablissement_formateur_num_departement: {
    type: String,
    default: null,
    description: "Numéro de departement formateur",
  },
  etablissement_formateur_nom_departement: {
    type: String,
    default: null,
    description: "Nom du departement formateur",
  },
  etablissement_formateur_nom_academie: {
    type: String,
    default: null,
    description: "Nom de l'académie formateur",
  },
  etablissement_formateur_num_academie: {
    type: String,
    default: "0",
    description: "Numéro de l'académie formateur",
  },
  etablissement_formateur_siren: {
    type: String,
    default: null,
    description: "Numéro siren formateur",
  },
  etablissement_formateur_nda: {
    type: String,
    default: null,
    description: "Numéro Déclaration formateur",
  },
  etablissement_formateur_date_creation: {
    type: Date,
    default: null,
    description: "Date de création de l'établissement",
  },
  etablissement_formateur_courriel: {
    noIndex: true,
    type: String,
    default: null,
    description: "Adresse email de contact de l'établissement formateur",
  },
  etablissement_formateur_actif: {
    type: String,
    default: null,
    description: "SIRET actif ou inactif pour l'établissement formateur",
  },
};

module.exports = etablissementFormateurInfo;
