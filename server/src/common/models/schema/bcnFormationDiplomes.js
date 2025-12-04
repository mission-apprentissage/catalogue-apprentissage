const bcnFormationDiplomesSchema = {
  FORMATION_DIPLOME: {
    index: true,
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  NIVEAU_FORMATION_DIPLOME: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  GROUPE_SPECIALITE: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  LETTRE_SPECIALITE: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  ANCIEN_RECME: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  LIBELLE_COURT: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  LIBELLE_STAT_33: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  LIBELLE_LONG_200: {
    index: true,
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DATE_OUVERTURE: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DATE_FERMETURE: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  ANCIEN_DIPLOME_1: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  ANCIEN_DIPLOME_2: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  ANCIEN_DIPLOME_3: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  ANCIEN_DIPLOME_4: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  ANCIEN_DIPLOME_5: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  ANCIEN_DIPLOME_6: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  ANCIEN_DIPLOME_7: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  NOUVEAU_DIPLOME_1: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  NOUVEAU_DIPLOME_2: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  NOUVEAU_DIPLOME_3: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  NOUVEAU_DIPLOME_4: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  NOUVEAU_DIPLOME_5: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  NOUVEAU_DIPLOME_6: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  NOUVEAU_DIPLOME_7: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  UNITE_CAPITALISABLE: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DATE_PREMIERE_SESSION: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DATE_DERNIERE_SESSION: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DATE_ARRETE_CREATION: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DATE_ARRETE_ABROGATION: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DATE_ARRETE_MODIFICATION_1: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DATE_ARRETE_MODIFICATION_2: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DATE_ARRETE_MODIFICATION_3: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DATE_ARRETE_MODIFICATION_4: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DATE_ARRETE_MODIFICATION_5: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DATE_ARRETE_MODIFICATION_6: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DATE_ARRETE_MODIFICATION_7: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DATE_ARRETE_MODIFICATION_8: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DATE_ARRETE_MODIFICATION_9: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DATE_ARRETE_MODIFICATION_10: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  COMMENTAIRE: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  NATURE_FORMATION_DIPLOME: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  GESTIONNAIRE_FORMATION_DIPLOME: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DATE_INTERVENTION: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  NUMERO_COMPTE: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  GESTION_DIFFUSION: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  NB_MEF_OUVERT: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  NB_MEF_FERME: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  ID_DOCUMENT: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  CITE_DOMAINE_FORMATION: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  DATE_SESSION_RATTRAPAGE: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  OBSERVATION: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  ID: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  CREATED_AT: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  UPDATED_AT: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  N_COMMENTAIRE: {
    type: String,
    default: null,
    description: "DESCRIPTION",
  },
  CITE_DOMAINE_DETAILLE: {
    type: String,
    default: null,
    description: "DESCRIPTION",
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
module.exports = bcnFormationDiplomesSchema;
