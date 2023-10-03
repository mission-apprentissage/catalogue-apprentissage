const mongoose = require("mongoose");
const {
  // eslint-disable-next-line no-unused-vars
  etablissement_formateur_id,
  // eslint-disable-next-line no-unused-vars
  etablissement_formateur_published,
  ...etablissementFormateurInfo
} = require("./etablissement.formateur.sub");
const {
  // eslint-disable-next-line no-unused-vars
  etablissement_gestionnaire_id,
  // eslint-disable-next-line no-unused-vars
  etablissement_gestionnaire_published,
  ...etablissementGestionnaireInfo
} = require("./etablissement.gestionnaire.sub");
const etablissementReferenceInfo = require("./etablissement.reference.sub");
const { rncpFormat } = require("../../format");
const { rncpDetailsSchema } = require("./rncpDetails/rncpDetails");
const { mefSchema } = require("./mef");

const formationSchema = {
  cle_ministere_educatif: {
    index: true,
    type: String,
    default: null,
    description: "Clé unique de la formation (pour envoi aux ministères éducatifs)",
  },

  // CFD
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

  // ADRESSE
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

  // IDENTIFICATION
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
  annee: {
    index: true,
    type: String,
    default: null,
    description: "Année de la formation (cursus)",
  },
  email: {
    type: String,
    default: null,
    select: false,
    noIndex: true,
    description: "Email du contact pour cette formation",
  },

  // ONISEP
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

  // RNCP
  rncp_code: {
    index: true,
    type: String,
    default: null,
    description: "Code RNCP",
    // validate: rncpFormat,
    validate: {
      validator: (value) => !value || rncpFormat.test(value),
      message: (props) => `${props.value} n'est pas un code RNCP valide.`,
    },
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

  published: {
    index: true,
    type: Boolean,
    default: false,
    description: "Est publiée, la formation est éligible pour le catalogue",
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
  // distance: {
  //   type: Number,
  //   default: null,
  //   description: "Distance entre les coordonnées transmises et déduites à partir de l'adresse",
  // },
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
  // distance_lieu_formation_etablissement_formateur: {
  //   type: Number,
  //   default: null,
  //   description: "distance entre le Lieu de formation et l'établissement formateur",
  // },
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
    description: "Formation éligible au catalogue générale",
  },

  date_fin: {
    type: [Date],
    default: [],
    description: "Formation éligible au catalogue générale",
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
};

module.exports = formationSchema;
