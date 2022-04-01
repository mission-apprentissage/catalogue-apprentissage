module.exports = {
  async up(db) {
    const formations = db.collection("formations");
    formations.updateMany({}, [
      {
        $set: {
          catalogue_published: "$etablissement_reference_catalogue_published",
          etablissement_gestionnaire_certifie_qualite: "$etablissement_gestionnaire_catalogue_published",
          etablissement_formateur_certifie_qualite: "$etablissement_formateur_catalogue_published",
          etablissement_reference_certifie_qualite: "$etablissement_reference_catalogue_published",
          etablissement_gestionnaire_habilite_rncp: "$rncp_etablissement_gestionnaire_habilite",
          etablissement_formateur_habilite_rncp: "$rncp_etablissement_formateur_habilite",
          etablissement_reference_habilite_rncp: "$rncp_etablissement_reference_habilite",
        },
      },
      {
        $unset: [
          "etablissement_gestionnaire_catalogue_published",
          "etablissement_formateur_catalogue_published",
          "etablissement_reference_catalogue_published",
          "rncp_etablissement_gestionnaire_habilite",
          "rncp_etablissement_formateur_habilite",
          "rncp_etablissement_reference_habilite",
        ],
      },
    ]);

    const etablissements = db.collection("etablissements");
    etablissements.updateMany({}, [
      {
        $set: {
          certifie_qualite: "$catalogue_published",
        },
      },
      {
        $unset: "catalogue_published",
      },
    ]);
  },

  async down(db) {
    const formations = db.collection("formations");
    formations.updateMany({}, [
      {
        $set: {
          etablissement_gestionnaire_catalogue_published: "$etablissement_gestionnaire_certifie_qualite",
          etablissement_formateur_catalogue_published: "$etablissement_formateur_certifie_qualite",
          etablissement_reference_catalogue_published: "$etablissement_reference_certifie_qualite",
          rncp_etablissement_gestionnaire_habilite: "$etablissement_gestionnaire_habilite_rncp",
          rncp_etablissement_formateur_habilite: "$etablissement_formateur_habilite_rncp",
          rncp_etablissement_reference_habilite: "$etablissement_reference_habilite_rncp",
        },
      },
      {
        $unset: [
          "catalogue_published",
          "etablissement_gestionnaire_certifie_qualite",
          "etablissement_formateur_certifie_qualite",
          "etablissement_reference_certifie_qualite",
          "etablissement_gestionnaire_habilite_rncp",
          "etablissement_formateur_habilite_rncp",
          "etablissement_reference_habilite_rncp",
        ],
      },
    ]);

    const etablissements = db.collection("etablissements");
    etablissements.updateMany({}, [
      {
        $set: {
          catalogue_published: "$certifie_qualite",
        },
      },
      {
        $unset: "certifie_qualite",
      },
    ]);
  },
};
