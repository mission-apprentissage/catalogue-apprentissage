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
        },
      },
      {
        $unset: [
          "etablissement_gestionnaire_catalogue_published",
          "etablissement_formateur_catalogue_published",
          "etablissement_reference_catalogue_published",
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
        },
      },
      {
        $unset: [
          "catalogue_published",
          "etablissement_gestionnaire_certifie_qualite",
          "etablissement_formateur_certifie_qualite",
          "etablissement_reference_certifie_qualite",
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
