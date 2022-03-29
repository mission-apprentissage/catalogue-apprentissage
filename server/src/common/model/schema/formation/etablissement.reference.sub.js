const etablissementReferenceInfo = {
  etablissement_reference: {
    type: String,
    default: null,
    description: "Etablissement reference est soit formateur soit le gestionnaire",
  },
  etablissement_reference_published: {
    type: Boolean,
    default: false,
    description: "Etablissement reference est publié",
  },
  etablissement_reference_catalogue_published: {
    index: true,
    type: Boolean,
    default: false,
    description: "Etablissement reference entre dans le catalogue (certifié Qualité & habilité RNCP)",
  },
  etablissement_reference_habilite_rncp: {
    type: Boolean,
    default: false,
    description: "Etablissement reference est habilité RNCP ou pas",
  },
  etablissement_reference_certifie_qualite: {
    type: Boolean,
    default: false,
    description: "Etablissement reference est certifié Qualité",
  },
  etablissement_reference_date_creation: {
    type: Date,
    default: null,
    description: "Date de création de l'établissement",
  },
};

module.exports = etablissementReferenceInfo;
