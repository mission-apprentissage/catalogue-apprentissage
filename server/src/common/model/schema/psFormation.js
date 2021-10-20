const psFormationSchema = {
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
  // SCRIPT COVERAGE
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
  matching_mna_etablissement: {
    type: Array,
    default: null,
    description: "Etablissement du catalogue matchant les formation présente dans matching_mna_formation",
  },
  matching_mna_parcoursup_statuts: {
    type: [String],
    default: [],
    description: "Statuts ParcourSup MNA module de perimetre",
  },
  etat_reconciliation: {
    type: Boolean,
    default: false,
    description: "Etat de la réconciliation de la formation",
  },
  statut_reconciliation: {
    type: String,
    default: "INCONNU",
    enum: ["AUTOMATIQUE", "VALIDE", "REJETE", "INCONNU", "A_VERIFIER"],
    description: "Statut",
  },
  id_reconciliation: {
    type: String,
    default: null,
    description: "id mongo reconciliation",
  },
  matching_rejete_updated: {
    type: Boolean,
    default: false,
    description: "Si la formation Précédemment Rejeté a été mise à jour",
  },
  matching_rejete_raison: {
    type: String,
    default: null,
    description: "Affelnet : raison de dépublication",
  },
  statuts_history: {
    type: [Object],
    default: [],
    description: "historique des statuts",
    noIndex: true,
  },
  id_parcoursup: {
    type: String,
    default: null,
    description: "identifiant unique de la formation côté parcoursup (CODEFORMATIONINSCRIPTION)",
  },
  uai_cerfa: {
    type: String,
    default: null,
    description: "uai renseigné sur la fiche CERFA",
  },
  uai_insert_jeune: {
    type: String,
    default: null,
    description: "uai insert jeune",
  },
  uai_map: {
    type: String,
    default: null,
    description: "uai",
  },
  siret_cerfa: {
    type: String,
    default: null,
    description: "siret renseigné sur la fiche CERFA",
  },
  siret_map: {
    type: String,
    default: null,
    description: "siret",
  },
  codediplome_map: {
    type: String,
    default: null,
    description: "cfd map",
  },
  code_formation_inscription: {
    type: String,
    default: null,
    description: "CODEFORMATIONINSCRIPTION",
  },
  code_formation_accueil: {
    type: String,
    default: null,
    description: "CODEFORMATIONACCUEIL",
  },
  latitude: {
    type: String,
    default: null,
    description: "LATITUDE",
  },
  longitude: {
    type: String,
    default: null,
    description: "LONGITUDE",
  },
  complement_adresse: {
    type: String,
    default: null,
    description: "COMPLEMENTADRESSE",
  },
  complement_adresse_1: {
    type: String,
    default: null,
    description: "COMPLEMENTADRESSE1",
  },
  complement_adresse_2: {
    type: String,
    default: null,
    description: "COMPLEMENTADRESSE2",
  },
  complement_code_postal: {
    type: String,
    default: null,
    description: "COMPLEMENTCODEPOSTAL",
  },
  complement_commune: {
    type: String,
    default: null,
    description: "COMPLEMENTCOMMUNE",
  },
  libelle_insert_jeune: {
    type: String,
    default: null,
    description: "LIB_INS",
  },
  complement_cedex: {
    type: String,
    default: null,
    description: "COMPLEMENTCEDEX",
  },
  adresse_etablissement_l1: {
    type: String,
    default: null,
    description: "PREMIERELIGNEADRESSEETAB",
  },
  adresse_etablissement_l2: {
    type: String,
    default: null,
    description: "SECONDELIGNEADRESSEETAB",
  },
  codes_cfd_mna: {
    type: [String],
    default: null,
    description: "CODE_CFD_MNA",
  },
  codes_rncp_mna: {
    type: [String],
    default: null,
    description: "CODE_RNCP_MNA",
  },
  codes_romes_mna: {
    type: [String],
    default: null,
    description: "CODE_ROMES_MNA",
  },
  type_rapprochement_mna: {
    type: String,
    default: null,
    description: "TYPE_RAPPROCHEMENT_MNA",
  },
};

module.exports = psFormationSchema;
