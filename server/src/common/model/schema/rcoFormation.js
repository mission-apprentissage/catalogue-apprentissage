const rcoFormationsSchema = {
  cle_ministere_educatif: {
    index: true,
    type: String,
    default: null,
    description: "Clé unique de la formation (pour envoi aux ministères éducatifs)",
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
    description: "Identifant des actions concaténés",
  },
  id_certifinfo: {
    index: true,
    type: String,
    default: null,
    description: "Identifant certifInfo (unicité de la certification)",
  },
  etablissement_gestionnaire_siret: {
    type: String,
    default: null,
    description: "Numéro de siret de l'établissement gestionnaire",
  },
  etablissement_gestionnaire_uai: {
    type: String,
    default: null,
    description: "Numéro d'UAI de l'établissement gestionnaire",
  },
  etablissement_gestionnaire_adresse: {
    type: String,
    default: null,
    description: "Adresse de l'établissement gestionnaire",
  },
  etablissement_gestionnaire_code_postal: {
    type: String,
    default: null,
    description: "Code postal de l'établissement gestionnaire",
  },
  etablissement_gestionnaire_code_insee: {
    type: String,
    default: null,
    description: "Code commune Insee de l'établissement gestionnaire",
  },
  etablissement_gestionnaire_geo_coordonnees: {
    type: String,
    implicit_type: "geo_point",
    description: "Latitude et longitude de l'établissement gestionnaire",
  },
  etablissement_formateur_siret: {
    type: String,
    default: null,
    description: "Numéro de siret de l'établissement formateur",
  },
  etablissement_formateur_uai: {
    type: String,
    default: null,
    description: "Numéro d'UAI de l'établissement formateur",
  },
  etablissement_formateur_adresse: {
    type: String,
    default: null,
    description: "Adresse de l'établissement formateur",
  },
  etablissement_formateur_code_postal: {
    type: String,
    default: null,
    description: "Code postal de l'établissement formateur",
  },
  etablissement_formateur_code_insee: {
    type: String,
    default: null,
    description: "Code commune Insee de l'établissement formateur",
  },
  etablissement_formateur_geo_coordonnees: {
    type: String,
    implicit_type: "geo_point",
    description: "Latitude et longitude de l'établissement formateur",
  },
  etablissement_lieu_formation_siret: {
    type: String,
    default: null,
    description: "Numéro de siret du lieu de formation",
  },
  etablissement_lieu_formation_uai: {
    type: String,
    default: null,
    description: "Numéro d'UAI du lieu de formation",
  },
  etablissement_lieu_formation_adresse: {
    type: String,
    default: null,
    description: "Adresse du lieu de formation",
  },
  etablissement_lieu_formation_code_postal: {
    type: String,
    default: null,
    description: "Code postal du lieu de formation",
  },
  etablissement_lieu_formation_code_insee: {
    type: String,
    default: null,
    description: "Code commune Insee du lieu de formation",
  },
  etablissement_lieu_formation_geo_coordonnees: {
    type: String,
    implicit_type: "geo_point",
    description: "Latitude et longitude du lieu de formation",
  },
  cfd: {
    type: String,
    default: null,
    description: "Code Formation Diplôme (education nationale)",
  },
  rncp_code: {
    type: String,
    default: null,
    description: "Code RNCP",
  },
  capacite: {
    type: String,
    default: null,
    description: "Capacité d'accueil",
  },
  periode: {
    type: [String],
    default: [],
    description: "Période d'inscription à la formation",
  },
  email: {
    type: String,
    default: null,
    select: false,
    noIndex: true,
    description: "Email de contact pour cette formation",
  },
  updates_history: {
    type: [Object],
    default: [],
    description: "Historique des mises à jours",
  },
  published: {
    index: true,
    type: Boolean,
    default: true,
    description: "Est publiée",
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
  converted_to_mna: {
    index: true,
    type: Boolean,
    default: false,
    description: "A été convertie en mna formation",
  },
  conversion_error: {
    type: String,
    default: null,
    description: "Erreur lors de la conversion de la formation",
  },
  id_rco_formation: {
    index: true,
    type: String,
    default: null,
    description: "Id de formation RCO (id_formation + id_action + id_certifinfo)",
  },
  niveau_entree_obligatoire: {
    type: String,
    default: null,
    description: "Niveau d'entrée de l'apprenti minimum obligatoire pour cette formation",
  },
  entierement_a_distance: {
    type: String,
    default: null,
    description: "Renseigné si la formation peut être suivie entièrement à distance",
  },
  etablissement_formateur_courriel: {
    type: String,
    default: null,
    description: "Adresse email de contact de l'établissement formateur",
  },
  etablissement_gestionnaire_courriel: {
    type: String,
    default: null,
    description: "Adresse email de contact de l'établissement gestionnaire",
  },
  intitule_formation: {
    type: String,
    default: null,
    description: "Intitule de la formation",
  },
  parcours: {
    type: String,
    default: null,
    description:
      "Parcours suivi sur 3 caractères : P00 (quand la question du parcours ne se pose pas), sinon  P01, P02 et Pnt – tant que les sessions ne sont pas expertisées",
  },
  duree: {
    type: String,
    default: null,
    description: "Durée de la formation en années (1 à 5, X si en cours de collecte)",
  },
  entree_apprentissage: {
    type: String,
    default: null,
    description: "Année d'entrée en apprentissage (1 à 5, X si en cours de collecte)",
  },
  lieu_different: {
    type: String,
    default: null,
    description:
      "Code du lieu sur 3 caractères : L00 (quand la question du lieu ne se pose pas), sinon  L01, L2 et Lnt – tant que les sessions ne sont pas expertisées",
  },
};

module.exports = rcoFormationsSchema;
