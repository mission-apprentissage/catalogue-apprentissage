const psCoverageSchema = {
  uai_gestionnaire: {
    type: String,
    default: null,
    description: "Uai gestionnaire de l'établissement",
  },
  uai_composante: {
    type: String,
    default: null,
    description: "Uai composante de l'établissement",
  },
  uai_affilie: {
    type: String,
    default: null,
    description: "Uai affilié de l'établissement",
  },
  libelle_uai_composante: {
    type: String,
    default: null,
    description: "Libellé de l'uai composante",
  },
  libelle_uai_affilie: {
    type: String,
    default: null,
    description: "Libellé de l'uai affilié",
  },
  code_commune_insee: {
    type: String,
    default: null,
    description: "Code commune  de l'établissement",
  },
  libelle_commune: {
    type: String,
    default: null,
    description: "Libellé de la commune",
  },
  code_postal: {
    type: String,
    default: null,
    description: "Code postal de l'établissement ",
  },
  nom_academie: {
    type: String,
    default: null,
    description: "Nom de l'académie référente de l'établissement",
  },
  code_ministere: {
    type: String,
    default: null,
    description: "Code du ministère responsable rattaché à l'établissement",
  },
  libelle_ministere: {
    type: String,
    default: null,
    description: "Code du ministère responsable rattaché à l'établissement",
  },
  type_etablissement: {
    type: String,
    default: null,
    description: "Type d'établissement délivrant la formation",
  },
  code_formation: {
    type: String,
    default: null,
    description: "Code de la formation",
  },
  libelle_formation: {
    type: String,
    default: null,
    description: "Libelle de la formation",
  },
  code_specialite: {
    type: String,
    default: null,
    description: "Code de la spécialité",
  },
  libelle_specialite: {
    type: String,
    default: null,
    description: "Libelle de la spécialité",
  },
  code_formation_initiale: {
    type: String,
    default: null,
    description: "Code de la formation à laquelle la spécialité est rattaché",
  },
  code_mef_10: {
    type: String,
    default: null,
    description: "Code MEF de la formation",
  },
  code_cfd: {
    type: String,
    default: null,
    description: "Code formation diplome de la formation",
  },
  code_cfd_2: {
    type: String,
    default: null,
    description: "Code formation diplome extra de la formation",
  },
  code_cfd_3: {
    type: String,
    default: null,
    description: "Code formation diplome extra de la formation",
  },
  matching_type: {
    type: String,
    default: null,
    description: "Force du matching avec le catalogue des formations",
  },
  matching_mna_formation: {
    type: Array,
    default: null,
    description: "Formations du catalogue matchant la formation parcoursup",
  },
};
module.exports = psCoverageSchema;
