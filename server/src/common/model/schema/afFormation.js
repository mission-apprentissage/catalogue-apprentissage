const afFormationSchema = {
  // Etablissement
  uai: {
    type: String,
    default: null,
    description: "uai de l'établissement de formation",
  },
  libelle_type_etablissement: {
    type: String,
    default: null,
    description: "libellé du type de l'établissement (centre de formation d'apprentis, lycée, etc..) de formation",
  },
  libelle_etablissement: {
    type: String,
    default: null,
    description: "libellé nom de l'établissement de formation",
  },
  adresse: {
    type: String,
    default: null,
    description: "numéro et adresse de l'établissement de formation",
  },
  code_postal: {
    type: String,
    default: null,
    description: "code postal de l'établissement de formation",
  },
  commune: {
    type: String,
    default: null,
    description: "commune de l'établissement de formation",
  },
  telephone: {
    type: String,
    default: null,
    description: "Téléphone de l'établissement de formation",
  },
  email: {
    type: String,
    default: null,
    description: "email de l'établissement de formation",
  },
  academie: {
    type: String,
    default: null,
    description: "nom de l'academie de l'établissement de formation",
  },
  ministere: {
    type: String,
    default: null,
    description: "ministère auquel est rattaché l'établissement de formation",
  },
  etablissement_type: {
    type: String,
    default: null,
    description: "type d'établissement (Privée / Public)",
  },
  type_contrat: {
    type: String,
    default: null,
    description: "type de contrat pris en charge par l'établissement de formation",
  },
  code_type_etablissement: {
    type: String,
    default: null,
    description: "code du type de l'établissement de formation",
  },
  code_nature: {
    type: String,
    default: null,
    description: "code nature de l'établissement de formation",
  },
  code_district: {
    type: String,
    default: null,
    description: "code district de l'établissement de formation",
  },
  code_bassin: {
    type: String,
    default: null,
    description: "code bassin de l'établissement de formation",
  },
  cio: {
    type: String,
    default: null,
    description: "code cio",
  },
  internat: {
    type: Boolean,
    default: null,
    description: "l'établissement propose un internat",
  },
  reseau_ambition_reussite: {
    type: Boolean,
    default: null,
    description: "L'établissement fait partie du réseau ambition réussite",
  },

  // Formation
  libelle_mnemonique: {
    type: String,
    default: null,
    description: "libellé mnémonique de la formation",
  },
  code_specialite: {
    type: String,
    default: null,
    description: "code spécialité de la formation",
  },
  libelle_ban: {
    type: String,
    default: null,
    description: "libellé BAN de la formation",
  },
  code_cfd: {
    type: String,
    default: null,
    description: "code formation diplôme de la formation",
  },
  code_mef: {
    type: String,
    default: null,
    description: "code MEF de la formation",
  },
  code_voie: {
    type: String,
    default: null,
    description: "code voie de la formation",
  },
  type_voie: {
    type: String,
    default: null,
    description: "type de voie de la formation",
  },
  saisie_possible_3eme: {
    type: Boolean,
    default: null,
    description: "saisie possible depuis la 3ème année de collège",
  },
  saisie_reservee_segpa: {
    type: Boolean,
    default: null,
    description: "saisie reservé au filière SEGPA",
  },
  saisie_possible_2nde: {
    type: Boolean,
    default: null,
    description: "saisie possible depuis la 2nde (1ère année de lycée)",
  },

  // Téléservice affection (TSA)
  visible_tsa: {
    type: Boolean,
    default: null,
    description: "formation affiché dans le TSA",
  },
  libelle_formation: {
    type: String,
    default: null,
    description: "libellé affiché dans le sa",
  },
  url_onisep_formation: {
    type: String,
    default: null,
    description: "url description formation onisep",
  },
  libelle_etablissement_tsa: {
    type: String,
    default: null,
    description: "Libellé long de l'établissement délivrant la formation",
  },
  url_onisep_etablissement: {
    type: String,
    default: null,
    description: "url description établissement onisep",
  },
  ville: {
    type: String,
    default: null,
    description: "ville de l'établissement",
  },
  campus_metier: {
    type: Boolean,
    default: null,
    description: "campus métier",
  },
  modalites: {
    type: Boolean,
    default: null,
    description: "condition particulière",
  },
  coordonnees_gps_latitude: {
    type: String,
    default: null,
    description: "coordonnées latitude de l'établissement",
  },
  coordonnees_gps_longitude: {
    type: String,
    default: null,
    description: "coordonnées longitude de l'établissement",
  },

  // Coverage
  matching_mna_formation: {
    type: Array,
    default: [],
    description: "tableau des matching des formations catalogue",
  },
  matching_mna_etablissement: {
    type: Array,
    default: [],
    description: "tableau des matching des établissement catalogue",
  },
  matching_type: {
    type: String,
    default: null,
    description: "force du matching",
  },
};

module.exports = afFormationSchema;
