const trainingSchema = {
  etablissement_formateur_id: {
    type: Object,
    default: {},
    description: "Identifiant établissement formateur",
  },
  etablissement_formateur_siret: {
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
    type: String,
    default: null,
    description: "UAI de l'etablissement formateur",
  },
  etablissement_formateur_type: {
    type: String,
    default: null,
    description: "Etablissement formateur est un CFA ou un OF",
  },
  etablissement_formateur_conventionne: {
    type: String,
    default: null,
    description: "Etablissement formateur est conventionné ou pas",
  },
  etablissement_formateur_declare_prefecture: {
    type: String,
    default: null,
    description: "Etablissement formateur est déclaré en prefecture",
  },
  etablissement_formateur_datadock: {
    type: String,
    default: null,
    description: "Etablissement formateur est connu de datadock",
  },
  etablissement_formateur_published: {
    type: Boolean,
    default: false,
    description: "Etablissement formateur est publié",
  },
  etablissement_formateur_catalogue_published: {
    type: Boolean,
    default: false,
    description: "Etablissement formateur entre dans le catalogue",
  },
  etablissement_responsable_id: {
    type: Object,
    default: {},
    description: "Identifiant établissement responable",
  },
  etablissement_responsable_siret: {
    type: String,
    default: null,
    description: "Numéro siret responsable",
  },
  etablissement_responsable_enseigne: {
    type: String,
    default: null,
    description: "Enseigne établissement responsable",
  },
  etablissement_responsable_uai: {
    type: String,
    default: null,
    description: "UAI de l'etablissement responsable",
  },
  etablissement_responsable_type: {
    type: String,
    default: null,
    description: "Etablissement responsable est un CFA ou un OF",
  },
  etablissement_responsable_conventionne: {
    type: String,
    default: null,
    description: "Etablissement responsable est conventionné ou pas",
  },
  etablissement_responsable_declare_prefecture: {
    type: String,
    default: null,
    description: "Etablissement responsable est déclaré en prefecture",
  },
  etablissement_responsable_datadock: {
    type: String,
    default: null,
    description: "Etablissement responsable est connu de datadock",
  },
  etablissement_responsable_published: {
    type: Boolean,
    default: false,
    description: "Etablissement responsable est publié",
  },
  etablissement_responsable_catalogue_published: {
    type: Boolean,
    default: false,
    description: "Etablissement responsable entre dans le catalogue",
  },
  etablissement_reference: {
    type: String,
    default: null,
    description:
      "Etablissement reference est égale à l'établissement formateur ou responsable (formateur | responsable)",
  },
  etablissement_reference_id: {
    type: Object,
    default: {},
    description: "Identifiant établissement reference",
  },
  etablissement_reference_type: {
    type: String,
    default: null,
    description: "Etablissement reference est un CFA ou un OF",
  },
  etablissement_reference_conventionne: {
    type: String,
    default: null,
    description: "Etablissement reference est conventionné ou pas",
  },
  etablissement_reference_declare_prefecture: {
    type: String,
    default: null,
    description: "Etablissement reference est déclaré en prefecture",
  },
  etablissement_reference_datadock: {
    type: String,
    default: null,
    description: "Etablissement reference est connu de datadock",
  },
  etablissement_reference_catalogue_published: {
    type: Boolean,
    default: false,
    description: "Etablissement reference entre dans le catalogue général",
  },
  etablissement_reference_published: {
    type: Boolean,
    default: false,
    description: "Etablissement reference est publié",
  },
  geo_coordonnees_etablissement_reference: {
    type: String,
    implicit_type: "geo_point",
    description: "Latitude et longitude de l'établissement de référence",
  },
  geo_coordonnees_etablissement_formateur: {
    type: String,
    implicit_type: "geo_point",
    description: "Latitude et longitude de l'établissement formateur",
  },
  geo_coordonnees_etablissement_responsable: {
    type: String,
    implicit_type: "geo_point",
    description: "Latitude et longitude de l'établissement responsable",
  },
  idea_geo_coordonnees_etablissement: {
    type: String,
    implicit_type: "geo_point",
    description: "Latitude et longitude de l'établissement recherchable dans Idea",
  },
  etablissement_reference_adresse: {
    type: String,
    default: null,
    description: "Numéro et rue établissement reference",
  },
  etablissement_reference_code_postal: {
    type: String,
    default: null,
    description: "Code postal établissement reference",
  },
  etablissement_reference_localite: {
    type: String,
    default: null,
    description: "Localité établissement reference",
  },
  etablissement_reference_cedex: {
    type: String,
    default: null,
    description: "Cedex",
  },
  etablissement_reference_complement_adresse: {
    type: String,
    default: null,
    description: "Complément d'adresse de l'établissement",
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
  etablissement_formateur_entreprise_raison_sociale: {
    type: String,
    default: null,
    description: "Raison sociale établissement formateur",
  },
  etablissement_formateur_cedex: {
    type: String,
    default: null,
    description: "Cedex",
  },
  etablissement_responsable_adresse: {
    type: String,
    default: null,
    description: "Numéro et rue établissement responsable",
  },
  etablissement_responsable_code_postal: {
    type: String,
    default: null,
    description: "Code postal établissement responsable",
  },
  etablissement_responsable_localite: {
    type: String,
    default: null,
    description: "Localité établissement responsable",
  },
  etablissement_responsable_complement_adresse: {
    type: String,
    default: null,
    description: "Complément d'adresse de l'établissement",
  },
  etablissement_responsable_cedex: {
    type: String,
    default: null,
    description: "Cedex",
  },
  etablissement_responsable_entreprise_raison_sociale: {
    type: String,
    default: null,
    description: "Raison sociale établissement responsable",
  },
  entreprise_raison_sociale: {
    type: String,
    default: null,
    description: "Raison sociale de l'entreprise",
  },
  siren: {
    type: String,
    default: null,
    description: "Numéro siren",
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
  nom_academie_siege: {
    type: String,
    default: null,
    description: "Nom de l'académie siége",
  },
  num_academie_siege: {
    type: Number,
    default: 0,
    description: "Numéro de l'académie siége",
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
  ds_id_dossier: {
    type: String,
    default: null,
    description: "Numéro de dossier Démarche Simplifiée",
  },
  uai_formation: {
    type: String,
    default: null,
    description: "UAI de la formation",
  },
  nom: {
    type: String,
    default: null,
    description: "Nom de la formation",
  },
  intitule: {
    type: String,
    default: null,
    description: "Ancien Intitulé DS",
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
  educ_nat_code: {
    type: String,
    default: null,
    description: "Code education nationale",
  },
  educ_nat_specialite_lettre: {
    type: String,
    default: null,
    description: "Lettre spécialité du code education nationale",
  },
  educ_nat_specialite_libelle: {
    type: String,
    default: null,
    description: "Libellé spécialité du code education nationale",
  },
  educ_nat_specialite_libelle_court: {
    type: String,
    default: null,
    description: "Libellé court spécialité du code education nationale",
  },
  mef_10_code: {
    type: String,
    default: null,
    description: "Code MEF 10 caractères",
  },
  mef_10_codes: {
    type: [String],
    default: [],
    description: "List des codes MEF 10 caractères",
  },
  mef_10_code_updated: {
    type: Boolean,
    default: false,
    description: "Temporaire - Code MEF 10 a été trouvé via la BCN",
  },
  mef_8_code: {
    type: String,
    default: null,
    description: "Code MEF 8 caractères",
  },
  mef_8_codes: {
    type: [String],
    default: [],
    description: "List des codes MEF 8 caractères",
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
  rncp_etablissement_formateur_habilite: {
    type: Boolean,
    default: false,
    description: "Etablissement formateur est habilité RNCP ou pas",
  },
  rncp_etablissement_responsable_habilite: {
    type: Boolean,
    default: false,
    description: "Etablissement responsable est habilité RNCP ou pas",
  },
  rncp_etablissement_reference_habilite: {
    type: Boolean,
    default: false,
    description: "Etablissement reference est habilité RNCP ou pas",
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
    type: String,
    default: "NON",
    description: "La formation est présent sur parcourSup",
  },
  parcoursup_a_charger: {
    type: Boolean,
    default: false,
    description: "La formation doit être ajouter à ParcourSup",
  },
  affelnet_reference: {
    type: String,
    default: "NON",
    description: "La formation est présent sur affelnet",
  },
  affelnet_a_charger: {
    type: Boolean,
    default: false,
    description: "La formation doit être ajouter à affelnet",
  },
  info_bcn_code_en: {
    type: Number,
    default: 0,
    description: "le codeEn est présent ou pas dans la base BCN",
  },
  info_bcn_intitule_court: {
    type: Number,
    default: 0,
    description: "l'intitulé court est présent ou pas dans la base BCN",
  },
  info_bcn_intitule_long: {
    type: Number,
    default: 0,
    description: "l'intitulé long est présent ou pas dans la base BCN",
  },
  info_bcn_niveau: {
    type: Number,
    default: 0,
    description: "Niveau a été mis à jour par la base BCN",
  },
  info_bcn_diplome: {
    type: Number,
    default: 0,
    description: "Diplome a été mis à jour par la base BCN",
  },
  info_bcn_mef: {
    type: Number,
    default: 0,
    description: "code MEF 10 a été créé ou mis à jour par la base BCN",
  },
  computed_bcn_code_en: {
    type: String,
    default: null,
    description: "Valeur intelligible evaluée",
  },
  computed_bcn_intitule_long: {
    type: String,
    default: null,
    description: "Valeur intelligible evaluée",
  },
  computed_bcn_intitule_court: {
    type: String,
    default: null,
    description: "Valeur intelligible evaluée",
  },
  computed_bcn_niveau: {
    type: String,
    default: null,
    description: "Valeur intelligible evaluée",
  },
  computed_bcn_diplome: {
    type: String,
    default: null,
    description: "Valeur intelligible evaluée",
  },
  computed_bcn_mef: {
    type: String,
    default: null,
    description: "Valeur intelligible evaluée",
  },
  source: {
    type: String,
    default: null,
    description: "Origine de la formation",
  },
  commentaires: {
    type: String,
    default: null,
    description: "Commentaire",
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
  last_modification: {
    type: String,
    default: null,
    description: "Qui a réalisé la derniere modification",
  },
  to_verified: {
    type: Boolean,
    default: false,
    description: "Formation à vérifier manuellement",
  },
  published_old: {
    type: Boolean,
    default: false,
    description: "ancien published à re-verifier coté métier 588 false",
  },
  published: {
    type: Boolean,
    default: false,
    description: "Est publiée, la formation est éligible pour le catalogue",
  },
  draft: {
    type: Boolean,
    default: false,
    description: "Est publiée, la formation est éligible pour le catalogue",
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

module.exports = trainingSchema;
