const etablissementFormateurInfo = require("./etablissement.formateur.sub");
const etablissementGestionnaireInfo = require("./etablissement.gestionnaire.sub");

const mnaFormationsSchema = {
  ...etablissementGestionnaireInfo,
  ...etablissementFormateurInfo,

  cfd: {
    type: String,
    default: null,
    description: "Code formation diplome (education nationale)",
  },
  cfd_specialite_lettre: {
    type: String,
    default: null,
    description: "Lettre spécialité du code cfd",
  },
  cfd_specialite_libelle: {
    type: String,
    default: null,
    description: "Libellé spécialité du code cfd",
  },
  cfd_specialite_libelle_court: {
    type: String,
    default: null,
    description: "Libellé court spécialité du code cfd",
  },
  mef_10_code: {
    type: String,
    default: null,
    description: "Code MEF 10 caractères",
  },
  nom_academie: {
    type: String,
    default: null,
    description: "Nom de l'académie",
  },
  num_academie: {
    type: Number,
    default: 0,
    description: "Numéro de l'académie",
  },
  code_postal: {
    type: String,
    default: null,
    description: "Code postal",
  },
  code_commune_insee: {
    type: String,
    default: null,
    description: "Code commune INSEE",
  },
  num_departement: {
    type: String,
    default: null,
    description: "Numéro de departement",
  },
  uai_formation: {
    type: String,
    default: null,
    description: "UAI de la formation",
  },
  nom: {
    type: String,
    default: null,
    description: "Nom de la formation déclaratif",
  },
  intitule_long: {
    type: String,
    default: null,
    description: "Intitulé long de la formation normalisé BCN",
  },
  intitule_court: {
    type: String,
    default: null,
    description: "Intitulé court de la formation normalisé BCN",
  },
  diplome: {
    type: String,
    default: null,
    description: "Diplôme ou titre visé",
  },
  niveau: {
    type: String,
    default: null,
    description: "Niveau de la formation",
  },
  onisep_url: {
    type: String,
    default: null,
    description: "Url de redirection vers le site de l'ONISEP",
  },
  rncp_code: {
    type: String,
    default: null,
    description: "Code RNCP",
  },
  rncp_intitule: {
    type: String,
    default: null,
    description: "Intitulé du code RNCP",
  },
  rncp_eligible_apprentissage: {
    type: Boolean,
    default: false,
    description: "Le titre RNCP est éligible en apprentissage",
  },

  rome_codes: {
    type: [String],
    default: [],
    description: "Codes ROME",
  },
  periode: {
    type: String,
    default: null,
    description: "Période d'inscription à la formation",
  },
  capacite: {
    type: String,
    default: null,
    description: "Capacité d'accueil",
  },
  duree: {
    type: String,
    default: null,
    description: "Durée de la formation en années",
  },
  annee: {
    type: String,
    default: null,
    description: "Année de la formation (cursus)",
  },

  email: {
    type: String,
    default: null,
    description: "Email du contact pour cette formation",
  },
  parcoursup_reference: {
    type: Boolean,
    default: false,
    description: "La formation est présent sur parcourSup",
  },
  parcoursup_a_charger: {
    type: Boolean,
    default: false,
    description: "La formation doit être ajouter à ParcourSup",
  },
  affelnet_reference: {
    type: Boolean,
    default: false,
    description: "La formation est présent sur affelnet",
  },
  affelnet_a_charger: {
    type: Boolean,
    default: false,
    description: "La formation doit être ajouter à affelnet",
  },
  source: {
    type: String,
    default: null,
    description: "Origine de la formation",
  },
  commentaires: {
    type: String,
    default: null,
    description: "Commentaires",
  },
  opcos: {
    type: [String],
    default: null,
    description: "Liste des opcos de la formation",
  },
  info_opcos: {
    type: Number,
    default: 0,
    description: "Code du statut de liaison avec un/des opcos",
  },
  info_opcos_intitule: {
    type: String,
    default: null,
    description: "Intitule du statut de liaison avec un/des opcos",
  },
  published: {
    type: Boolean,
    default: false,
    description: "Est publiée, la formation est éligible pour le catalogue",
  },
  draft: {
    type: Boolean,
    default: false,
    description: "En cours de creation",
  },
  created_at: {
    type: Date,
    default: Date.now,
    description: "Date d'ajout en base de données",
  },
  updates_history: {
    type: [Object],
    default: [],
    description: "Historique des mises à jours",
  },
  last_update_at: {
    type: Date,
    default: Date.now,
    description: "Date de dernières mise à jour",
  },
  last_update_who: {
    type: String,
    default: null,
    description: "Qui a réalisé la derniere modification",
  },

  // Flags
  to_verified: {
    type: Boolean,
    default: false,
    description: "Formation à vérifier manuellement",
  },

  // Product specific
  idea_geo_coordonnees_etablissement: {
    type: String,
    implicit_type: "geo_point",
    description: "Latitude et longitude de l'établissement recherchable dans Idea",
  },
};

module.exports = mnaFormationsSchema;
