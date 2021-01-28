const etablissementSchema = {
  siege_social: {
    type: Boolean,
    default: false,
    description: "Cet établissement est le siége sociale",
  },
  etablissement_siege_id: {
    type: Object,
    default: {},
    description: "Identifiant établissement siége",
  },
  etablissement_siege_siret: {
    type: String,
    default: null,
    description: "Numéro siret du siége sociale",
  },
  siret: {
    type: String,
    default: null,
    description: "Numéro siret",
  },
  siren: {
    type: String,
    default: null,
    description: "Numéro siren de l'entreprise",
  },
  naf_code: {
    type: String,
    default: null,
    description: "Code NAF",
  },
  naf_libelle: {
    type: String,
    default: null,
    description: "Libellé du code NAT (ex: Enseignement secondaire technique ou professionnel)",
  },
  tranche_effectif_salarie: {
    type: Object,
    default: {},
    description: "Tranche salariale",
  },
  date_creation: {
    type: Date,
    default: null,
    description: "Date de création",
  },
  date_mise_a_jour: {
    type: Date,
    default: null,
    description: "Date de création",
  },
  diffusable_commercialement: {
    type: Boolean,
    default: true,
    description: "Diffusable commercialement",
  },
  enseigne: {
    type: String,
    default: null,
    description: "Enseigne",
  },
  adresse: {
    type: String,
    default: null,
    description: "Adresse de l'établissement",
  },
  numero_voie: {
    type: String,
    default: null,
    description: "Numéro de la voie",
  },
  type_voie: {
    type: String,
    default: null,
    description: "Type de voie (ex: rue, avenue)",
  },
  nom_voie: {
    type: String,
    default: null,
    description: "Nom de la voie",
  },
  complement_adresse: {
    type: String,
    default: null,
    description: "Complément d'adresse de l'établissement",
  },
  code_postal: {
    type: String,
    default: null,
    description: "Code postal",
  },
  num_departement: {
    type: String,
    default: null,
    description: "Numéro de département",
  },
  localite: {
    type: String,
    default: null,
    description: "Localité",
  },
  code_insee_localite: {
    type: String,
    default: null,
    description: "Code Insee localité",
  },
  cedex: {
    type: String,
    default: null,
    description: "Cedex",
  },
  geo_coordonnees: {
    type: String,
    implicit_type: "geo_point",
    description: "Latitude et longitude de l'établissement",
  },
  date_fermeture: {
    type: Date,
    default: null,
    description: "Date de cessation d'activité",
  },
  ferme: {
    type: Boolean,
    default: false,
    description: "A cessé son activité",
  },
  region_implantation_code: {
    type: String,
    default: null,
    description: "Code région",
  },
  region_implantation_nom: {
    type: String,
    default: null,
    description: "Nom de la région",
  },
  commune_implantation_code: {
    type: String,
    default: null,
    description: "Code commune",
  },
  commune_implantation_nom: {
    type: String,
    default: null,
    description: "Nom de la commune",
  },
  pays_implantation_code: {
    type: String,
    default: null,
    description: "Code pays",
  },
  pays_implantation_nom: {
    type: String,
    default: null,
    description: "Nom du pays",
  },

  //////////////
  num_academie: {
    type: Number,
    default: 0,
    description: "Numéro de l'académie",
  },
  nom_academie: {
    type: String,
    default: null,
    description: "Nom de l'académie",
  },
  uai: {
    type: String,
    default: null,
    description: "UAI de l'établissement",
  },

  //////////////
  info_depp: {
    type: Number,
    default: 0,
    description: "L'établissement est présent ou pas dans le fichier DEPP",
  },
  info_dgefp: {
    type: Number,
    default: 0,
    description: "L'établissement est présent ou pas dans le fichier DGEFP",
  },
  info_datagouv_ofs: {
    type: Number,
    default: 0,
    description: "L'établissement est présent ou pas dans le fichier datagouv",
  },
  info_datadock: {
    type: Number,
    default: 0,
    description: "L'établissement est présent ou pas dans le fichier dataDock",
  },

  info_depp_info: {
    type: String,
    default: null,
    description: "L'établissement est présent ou pas dans le fichier DEPP",
  },
  info_dgefp_info: {
    type: String,
    default: null,
    description: "L'établissement est présent ou pas dans le fichier DGEFP",
  },
  info_datagouv_ofs_info: {
    type: String,
    default: null,
    description: "L'établissement est présent ou pas dans le fichier datagouv",
  },
  info_datadock_info: {
    type: String,
    default: null,
    description: "L'établissement est présent ou pas dans le fichier dataDock",
  },

  computed_type: {
    type: String,
    default: null,
    description: "Type de l'établissement CFA ou OF",
  },
  computed_declare_prefecture: {
    type: String,
    default: null,
    description: "Etablissement est déclaré en prefecture",
  },
  computed_conventionne: {
    type: String,
    default: null,
    description: "Etablissement est conventionné ou pas",
  },
  computed_info_datadock: {
    type: String,
    default: null,
    description: "Etablissement est connu de datadock",
  },
  api_entreprise_reference: {
    type: Boolean,
    default: false,
    description: "L'établissement est trouvé via l'API Entreprise",
  },
  parcoursup_a_charger: {
    type: Boolean,
    default: false,
    description: "L'établissement doit être ajouter à ParcourSup",
  },
  affelnet_a_charger: {
    type: Boolean,
    default: false,
    description: "La formation doit être ajouter à affelnet",
  },

  //
  entreprise_siren: {
    type: String,
    default: null,
    description: "Numéro siren",
  },
  entreprise_procedure_collective: {
    type: Boolean,
    default: false,
    description: "Procédure collective",
  },
  entreprise_enseigne: {
    type: String,
    default: null,
    description: "Enseigne",
  },
  entreprise_numero_tva_intracommunautaire: {
    type: String,
    default: null,
    description: "Numéro de TVA intracommunautaire",
  },
  entreprise_code_effectif_entreprise: {
    type: String,
    default: null,
    description: "Code éffectf",
  },
  entreprise_forme_juridique_code: {
    type: String,
    default: null,
    description: "Code forme juridique",
  },
  entreprise_forme_juridique: {
    type: String,
    default: null,
    description: "Forme juridique (ex: Établissement public local d'enseignement)",
  },
  entreprise_raison_sociale: {
    type: String,
    default: null,
    description: "Raison sociale",
  },
  entreprise_nom_commercial: {
    type: String,
    default: null,
    description: "Nom commercial",
  },
  entreprise_capital_social: {
    type: String,
    default: null,
    description: "Capital social",
  },
  entreprise_date_creation: {
    type: Date,
    default: null,
    description: "Date de création",
  },
  entreprise_date_radiation: {
    type: String,
    default: null,
    description: "Date de radiation",
  },
  entreprise_naf_code: {
    type: String,
    default: null,
    description: "Code NAF",
  },
  entreprise_naf_libelle: {
    type: String,
    default: null,
    description: "Libellé du code NAT (ex: Enseignement secondaire technique ou professionnel)",
  },
  entreprise_date_fermeture: {
    type: Date,
    default: null,
    description: "Date de cessation d'activité",
  },
  entreprise_ferme: {
    type: Boolean,
    default: false,
    description: "A cessé son activité",
  },
  entreprise_siret_siege_social: {
    type: String,
    default: null,
    description: "Numéro siret du siége sociale",
  },
  entreprise_nom: {
    type: String,
    default: null,
    description: "Nom du contact",
  },
  entreprise_prenom: {
    type: String,
    default: null,
    description: "Prénom du contact",
  },
  entreprise_categorie: {
    type: String,
    default: null,
    description: "Catégorie (PME, TPE, etc..)",
  },
  entreprise_tranche_effectif_salarie: {
    type: Object,
    default: {},
    description: "Tranche salarié",
  },
  ///////WILL BE REMOVE/////////
  formations_attachees: {
    type: Boolean,
    default: false,
    description: "l'établissement a des formations",
  },
  formations_ids: {
    type: [Object],
    default: [],
    description: "Id des formations rattachées",
  },
  formations_uais: {
    type: [String],
    default: [],
    description: "UAIs des formations rattachées à l'établissement",
  },
  formations_n3: {
    type: Boolean,
    default: false,
    description: "l'établissement a des formations de niveau 3",
  },
  formations_n4: {
    type: Boolean,
    default: false,
    description: "l'établissement a des formations de niveau 4",
  },
  formations_n5: {
    type: Boolean,
    default: false,
    description: "l'établissement a des formations de niveau 5",
  },
  formations_n6: {
    type: Boolean,
    default: false,
    description: "l'établissement a des formations de niveau 6",
  },
  formations_n7: {
    type: Boolean,
    default: false,
    description: "l'établissement a des formations de niveau 7",
  },
  // formations_responsable_ids: {
  //   type: [Object],
  //   default: [],
  //   description: "Id des formations rattachées où l'établissement est responsable",
  // },
  // formations_responsable_uais: {
  //   type: [String],
  //   default: [],
  //   description: "UAIs des formations rattachées où l'établissement est responsable",
  // },
  // formations_formateur_ids: {
  //   type: [Object],
  //   default: [],
  //   description: "Id des formations rattachées où l'établissement est formateur",
  // },
  // formations_formateur_uais: {
  //   type: [String],
  //   default: [],
  //   description: "UAIs des formations rattachées où l'établissement est formateur",
  // },
  ds_id_dossier: {
    type: String,
    default: null,
    description: "Numéro de dossier Démarche Simplifiée",
  },
  ds_questions_siren: {
    type: String,
    default: null,
    description: "Numéro SIREN saisi dans Démarche Simplifiée",
  },
  ds_questions_nom: {
    type: String,
    default: null,
    description: "Nom du contact saisi dans Démarche Simplifiée",
  },
  ds_questions_email: {
    type: String,
    default: null,
    description: "Email du contact saisi dans Démarche Simplifiée",
  },
  ds_questions_uai: {
    type: String,
    default: null,
    description: "UAI saisi dans Démarche Simplifiée",
  },
  ds_questions_has_agrement_cfa: {
    type: String,
    default: null,
    description: 'Réponse à la question "Avez vous l\'agrément CFA" dans Démarche Simplifiée',
  },
  ds_questions_has_certificaton_2015: {
    type: String,
    default: null,
    description: 'Réponse à la question "Avez vous la certification 2015" dans Démarche Simplifiée',
  },
  ds_questions_has_ask_for_certificaton: {
    type: String,
    default: null,
    description: 'Réponse à la question "Avez vous demandé la certification" dans Démarche Simplifiée',
  },
  ds_questions_ask_for_certificaton_date: {
    type: Date,
    default: null,
    description: 'Réponse à la question "Date de votre demande de certification" dans Démarche Simplifiée',
  },
  ds_questions_declaration_code: {
    type: String,
    default: null,
    description: 'Réponse à la question "Numéro de votre déclaration" dans Démarche Simplifiée',
  },
  ds_questions_has_2020_training: {
    type: String,
    default: null,
    description: 'Réponse à la question "Proposez-vous des formations en 2020" dans Démarche Simplifiée',
  },
  //////////////////

  catalogue_published: {
    type: Boolean,
    default: false,
    description: "Est publié dans le catalogue général",
  },

  published: {
    type: Boolean,
    default: false,
    description: "Est publié",
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
  updates_history: {
    type: [Object],
    default: [],
    description: "Historique des mises à jours",
  },
  update_error: {
    type: String,
    default: null,
    description: "Erreur lors de la mise à jour de la formation",
  },

  tags: {
    type: [String],
    default: [],
    description: "Tableau de tags (2020, 2021, RCO, etc.)",
  },

  // RCO fields
  rco_uai: {
    type: String,
    default: null,
    description: "UAI de l'établissement RCO",
  },
  rco_adresse: {
    type: String,
    default: null,
    description: "Adresse de l'établissement RCO ",
  },
  rco_code_postal: {
    type: String,
    default: null,
    description: "Code postal",
  },
  rco_code_insee_localite: {
    type: String,
    default: null,
    description: "Code Insee localité RCO",
  },
  rco_geo_coordonnees: {
    type: String,
    implicit_type: "geo_point",
    description: "Latitude et longitude de l'établissement RCO",
  },
};

module.exports = etablissementSchema;
