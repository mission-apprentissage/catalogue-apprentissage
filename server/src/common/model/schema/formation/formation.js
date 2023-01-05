const mongoose = require("mongoose");
const { isValideUAI } = require("@mission-apprentissage/tco-service-node");
const etablissementFormateurInfo = require("./etablissement.formateur.sub");
const etablissementGestionnaireInfo = require("./etablissement.gestionnaire.sub");
const etablissementReferenceInfo = require("./etablissement.reference.sub");

const modaliteSchema = new mongoose.Schema(
  {
    duree: String,
    annee: String,
  },
  { _id: false }
);

const mefSchema = new mongoose.Schema(
  {
    mef10: {
      index: true,
      type: String,
    },
    modalite: {
      type: modaliteSchema,
    },
  },
  { _id: false }
);

const rncpDetailsSchema = new mongoose.Schema(
  {
    date_fin_validite_enregistrement: {
      type: Date,
      default: null,
      description: "Date de validité de la fiche",
    },
    active_inactive: {
      type: String,
      default: null,
      description: "fiche active ou non",
    },
    etat_fiche_rncp: {
      type: String,
      default: null,
      description: "état fiche ex: Publiée",
    },
    niveau_europe: {
      type: String,
      default: null,
      description: "Niveau européen ex: niveauu5",
    },
    code_type_certif: {
      type: String,
      default: null,
      description: "Code type de certification (ex: DE)",
    },
    type_certif: {
      type: String,
      default: null,
      description: "Type de certification (ex: diplôme d'état)",
    },
    ancienne_fiche: {
      type: [String],
      default: null,
      description: "Code rncp de l'ancienne fiche",
    },
    nouvelle_fiche: {
      type: [String],
      default: null,
      description: "Code rncp de la nouvelle fiche",
    },
    demande: {
      type: Number,
      default: 0,
      description: "Demande en cours de d'habilitation",
    },
    certificateurs: {
      type: [Object],
      default: [],
      description: "Certificateurs",
    },
    nsf_code: {
      type: String,
      default: null,
      description: "Code NSF",
    },
    nsf_libelle: {
      type: String,
      default: null,
      description: "Libellé NSF",
    },
    romes: {
      type: [Object],
      default: [],
      description: "Romes",
    },
    blocs_competences: {
      type: [Object],
      default: [],
      description: "Blocs de compétences",
    },
    voix_acces: {
      type: [Object],
      default: [],
      description: "Voix d'accès",
    },
    partenaires: {
      type: [Object],
      default: [],
      description: "Partenaires",
    },
    rncp_outdated: {
      type: Boolean,
      default: false,
      description: "Code rncp périmé (date fin enregistrement avant le 31 aout de l'année courante)",
    },
  },
  { _id: false }
);

const rejectionCauseSchema = new mongoose.Schema(
  {
    error: {
      type: String,
      default: null,
      description: "L'erreur telle que retournée par la plateforme",
    },
    description: {
      type: String,
      default: null,
      description: "La description textuelle de l'erreur retournée",
    },
    action: {
      type: String,
      default: null,
      description: "L'action à mener pour résoudre le rejet.",
    },
    handled_by: {
      type: String,
      default: null,
      description: "Adresse email de la personne ayant pris en charge le rejet de publication",
    },
    handled_date: {
      type: Date,
      default: null,
      description: "Date à laquelle le rejet de publication a été pris en charge",
    },
  },
  { _id: false }
);

const formationSchema = {
  cle_ministere_educatif: {
    index: true,
    type: String,
    default: null,
    description: "Clé unique de la formation (pour envoi aux ministères éducatifs)",
  },
  cfd: {
    index: true,
    type: String,
    default: null,
    description: "Code formation diplôme (education nationale)",
  },
  cfd_specialite: {
    type: Object,
    default: null,
    description: "Lettre spécialité du code cfd",
  },
  cfd_outdated: {
    index: true,
    type: Boolean,
    default: false,
    description: "BCN : cfd périmé (fermeture avant le 31 août de l'année courante)",
  },
  cfd_date_fermeture: {
    type: Date,
    default: null,
    description: "Date de fermeture du cfd",
  },
  cfd_entree: {
    index: true,
    type: String,
    default: null,
    description: "Code formation diplôme d'entrée (année 1 de l'apprentissage)",
  },
  nom_academie: {
    type: String,
    default: null,
    description: "Nom de l'académie",
  },
  num_academie: {
    index: true,
    type: String,
    default: "0",
    description: "Numéro de l'académie",
  },
  code_postal: {
    type: String,
    default: null,
    description: "Code postal",
  },
  code_commune_insee: {
    index: true,
    type: String,
    default: null,
    description: "Code commune INSEE",
  },
  num_departement: {
    type: String,
    default: null,
    description: "Numéro de département",
  },
  nom_departement: {
    type: String,
    default: null,
    description: "Nom du département",
  },
  region: {
    type: String,
    default: null,
    description: "Numéro de département",
  },
  localite: {
    type: String,
    default: null,
    description: "Localité",
  },
  uai_formation: {
    index: true,
    type: String,
    default: null,
    description: "UAI du lieu de la formation",
    validate: {
      validator: async (value) => !value || (await isValideUAI(value)),
      message: (props) => `${props.value} n'est pas un code UAI valide.`,
    },
  },
  uai_formation_valide: {
    type: Boolean,
    default: null,
    description: "L'UAI du lieu de formation est il valide ?",
  },
  nom: {
    type: String,
    default: null,
    description: "Nom de la formation déclaratif",
  },
  intitule_rco: {
    type: String,
    default: null,
    description: "Intitulé comme transmis par RCO",
  },
  intitule_long: {
    index: true,
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
    index: true,
    type: String,
    default: null,
    description: "Diplôme ou titre visé",
  },
  niveau: {
    index: true,
    type: String,
    default: null,
    description: "Niveau de la formation",
  },
  onisep_url: {
    type: String,
    default: null,
    description: "Url de redirection vers le site de l'ONISEP",
  },

  onisep_intitule: {
    type: String,
    default: null,
    description: "Intitulé éditorial l'ONISEP",
  },

  onisep_libelle_poursuite: {
    type: String,
    default: null,
    description: "Libellé poursuite étude l'ONISEP (séparateur ;)",
  },
  onisep_lien_site_onisepfr: {
    type: String,
    default: null,
    description: "Lien vers site de l'ONISEP api",
  },
  onisep_discipline: {
    type: String,
    default: null,
    description: "Disciplines ONISEP (séparateur ;)",
  },
  onisep_domaine_sousdomaine: {
    type: String,
    default: null,
    description: "Domaine et sous domaine ONISEP (séparateur ;)",
  },

  rncp_code: {
    index: true,
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
  rncp_details: {
    type: rncpDetailsSchema,
    default: null,
    description: "Détails RNCP (bloc de compétences etc..)",
  },
  rome_codes: {
    index: true,
    type: [String],
    default: [],
    description: "Codes ROME",
  },
  periode: {
    type: [Date],
    default: [],
    description: "Périodes de début de la formation",
  },
  capacite: {
    type: String,
    default: null,
    description: "Capacité d'accueil",
  },
  duree: {
    index: true,
    type: String,
    default: null,
    description: "Durée de la formation en années",
  },
  duree_incoherente: {
    type: Boolean,
    default: null,
    description: "Durée incohérente avec les codes mefs",
  },
  annee: {
    index: true,
    type: String,
    default: null,
    description: "Année de la formation (cursus)",
  },
  annee_incoherente: {
    type: Boolean,
    default: null,
    description: "Année incohérente avec les codes mefs",
  },
  email: {
    type: String,
    default: null,
    select: false,
    noIndex: true,
    description: "Email du contact pour cette formation",
  },
  rejection: {
    type: rejectionCauseSchema,
    default: null,
    description: "Cause du rejet de publication",
  },
  last_statut_update_date: {
    type: Date,
    default: null,
    description: "Date de dernière modification du statut Affelnet ou Parcoursup",
  },
  published: {
    index: true,
    type: Boolean,
    default: false,
    description: "Est publiée, la formation est éligible pour le catalogue",
  },
  forced_published: {
    type: Boolean,
    default: false,
    description:
      "La publication vers les plateformes est forcée (contournement catalogue non-éligible dans certains cas)",
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
    description: "Qui a réalisé la dernière modification",
  },

  lieu_formation_geo_coordonnees: {
    type: String,
    implicit_type: "geo_point",
    description: "Latitude et longitude du lieu de formation",
  },
  lieu_formation_geo_coordonnees_computed: {
    type: String,
    implicit_type: "geo_point",
    description: "Latitude et longitude du lieu de formation déduit de l'adresse du flux RCO",
  },
  distance: {
    type: Number,
    default: null,
    description: "Distance entre les coordonnées transmises et déduites à partir de l'adresse",
  },
  lieu_formation_adresse: {
    index: true,
    type: String,
    default: null,
    description: "Adresse du lieu de formation",
  },
  lieu_formation_adresse_computed: {
    type: String,
    default: null,
    description: "Adresse du lieu de formation déduit de la géolocalisation du flux RCO",
  },
  lieu_formation_siret: {
    type: String,
    default: null,
    description: "Siret du lieu de formation",
  },
  id_rco_formation: {
    index: true,
    type: String,
    default: null,
    description: "**[DEPRECATED]** Id de formation RCO (id_formation + id_action + id_certifinfo)",
  },
  id_formation: {
    index: true,
    type: String,
    default: null,
    description: "Identifiant de la formation",
  },
  id_action: {
    index: true,
    type: String,
    default: null,
    description: "Identifiant des actions concaténés",
  },
  ids_action: {
    index: true,
    type: [String],
    default: [],
    description: "Identifiant des actions concaténés",
  },
  id_certifinfo: {
    index: true,
    type: String,
    default: null,
    description: "Identifiant certifInfo (unicité de la certification)",
  },
  tags: {
    type: [String],
    default: [],
    description: "Tableau de tags (2020, 2021, etc.)",
  },
  libelle_court: {
    type: String,
    default: null,
    description: "BCN : libelle court fusion table n_formation_diplome ou v_formation_diplome",
  },
  niveau_formation_diplome: {
    type: String,
    default: null,
    description: "BCN : niveau formation diplôme",
  },
  bcn_mefs_10: {
    type: [mefSchema],
    default: [],
    description: "BCN : Codes MEF 10 caractères",
  },
  editedFields: {
    type: Object,
    default: null,
    description: "Champs édités par un utilisateur",
  },
  distance_lieu_formation_etablissement_formateur: {
    type: Number,
    default: null,
    description: "distance entre le Lieu de formation et l'établissement formateur",
  },
  niveau_entree_obligatoire: {
    type: Number,
    default: null,
    description: "Niveau d'entrée de l'apprenti minimum obligatoire pour cette formation",
  },
  entierement_a_distance: {
    type: Boolean,
    default: false,
    description: "Renseigné si la formation peut être suivie entièrement à distance",
  },

  france_competence_infos: {
    type: new mongoose.Schema(
      {
        fc_is_catalog_general: Boolean,
        fc_is_habilite_rncp: Boolean,
        fc_is_certificateur: Boolean,
        fc_is_certificateur_siren: Boolean,
        fc_is_partenaire: Boolean,
        fc_has_partenaire: Boolean,
      },
      { _id: false }
    ),
    default: null,
    description: "Données pour étude France Compétence",
  },

  catalogue_published: {
    index: true,
    type: Boolean,
    default: false,
    description: "Formation éligible au catalogue générale",
  },

  date_debut: {
    type: [Date],
    default: [],
    description: "Dates de début de session",
  },

  date_fin: {
    type: [Date],
    default: [],
    description: "Dates de fin de session",
  },

  modalites_entrees_sorties: {
    type: [Boolean],
    default: [],
    description: "Session en entrée / sortie permanente",
  },

  id_RCO: {
    type: String,
    default: null,
    description: "Identifiant RCO",
  },

  // Etablissements
  ...etablissementGestionnaireInfo,
  ...etablissementFormateurInfo,
  ...etablissementReferenceInfo,

  // PARCOURSUP

  parcoursup_perimetre: {
    type: Boolean,
    default: false,
    description: "Dans le périmètre parcoursup",
  },
  parcoursup_statut: {
    type: String,
    enum: [
      "hors périmètre",
      "publié",
      "non publié",
      "à publier (sous condition habilitation)",
      "à publier (vérifier accès direct postbac)",
      "à publier (soumis à validation Recteur)",
      "à publier",
      "en attente de publication",
      "rejet de publication",
    ],
    default: "hors périmètre",
    description: "Statut parcoursup",
  },
  parcoursup_statut_history: {
    type: [Object],
    default: [],
    description: "Parcoursup : historique des statuts",
    noIndex: true,
  },
  parcoursup_error: {
    type: String,
    default: null,
    description: "Erreur lors de la création de la formation sur ParcourSup (via le WS)",
  },
  parcoursup_id: {
    index: true,
    type: String,
    default: null,
    description: "identifiant Parcoursup de la formation (g_ta_cod)",
  },
  parcoursup_published_date: {
    type: Date,
    default: null,
    description: 'Date de publication (passage au statut "publié")',
  },
  parcoursup_export_date: {
    type: Date,
    default: null,
    description: "Date de la dernière tentative d'export vers Parcoursup",
  },
  parcoursup_raison_depublication: {
    type: String,
    default: null,
    description: "Parcoursup : raison de dépublication",
  },
  parcoursup_mefs_10: {
    type: [mefSchema],
    default: [],
    description: "Tableau de Code MEF 10 caractères et modalités (filtrés pour Parcoursup si applicable)",
  },

  // AFFELNET
  affelnet_perimetre: {
    type: Boolean,
    default: false,
    description: "Dans le périmètre affelnet",
  },
  affelnet_statut: {
    type: String,
    enum: [
      "hors périmètre",
      "publié",
      "non publié",
      "à publier (soumis à validation)",
      "à publier",
      "en attente de publication",
    ],
    default: "hors périmètre",
    description: "Statut affelnet",
  },
  affelnet_statut_history: {
    type: [Object],
    default: [],
    description: "Affelnet : historique des statuts",
    noIndex: true,
  },
  affelnet_id: {
    index: true,
    type: String,
    default: null,
    description: "identifiant Affelnet de la formation (code vœu)",
  },
  affelnet_published_date: {
    type: Date,
    default: null,
    description: 'Date de publication (passage au statut "publié")',
  },
  affelnet_infos_offre: {
    type: String,
    default: null,
    description: "Affelnet : Informations offre de formation",
  },
  affelnet_url_infos_offre: {
    type: String,
    default: null,
    description: "Affelnet : Libellé ressource complémentaire",
  },
  affelnet_modalites_offre: {
    type: String,
    default: null,
    description: "Affelnet : Modalités particulières",
  },
  affelnet_url_modalites_offre: {
    type: String,
    default: null,
    description: "Affelnet : Lien vers la ressource",
  },
  affelnet_code_nature: {
    type: String,
    default: null,
    description: "Affelnet : code nature de l'établissement de formation",
  },
  affelnet_secteur: {
    type: String,
    enum: ["PR", "PU", null],
    default: null,
    description: "Affelnet : type d'établissement (PR: Privé / PU: Public)",
  },
  affelnet_raison_depublication: {
    type: String,
    default: null,
    description: "Affelnet : raison de dépublication",
  },
  affelnet_mefs_10: {
    type: [mefSchema],
    default: [],
    description: "Tableau de Code MEF 10 caractères et modalités (filtrés pour Affelnet si applicable)",
  },
};

module.exports = formationSchema;
