module.exports = {
  async up(db) {
    const etablissements = db.collection("etablissements");
    const formations = db.collection("formations");

    console.log(`Remove info_depp, info_depp_info, info_dgefp, info_dgefp_info fields from 'etablissement'`);

    await etablissements.updateMany({}, [{ $unset: ["info_depp", "info_depp_info", "info_dgefp", "info_dgefp_info"] }]);

    console.log(
      `Remove etablissement_formateur_type, etablissement_formateur_conventionne, etablissement_formateur_declare_prefecture, \
etablissement_gestionnaire_type, etablissement_gestionnaire_conventionne, etablissement_gestionnaire_declare_pr  efecture, \
etablissement_reference_type, etablissement_reference_conventionne, etablissement_reference_declare_prefecture fields from 'formations'`
    );

    await formations.updateMany({}, [
      {
        $unset: [
          "etablissement_formateur_type",
          "etablissement_formateur_conventionne",
          "etablissement_formateur_declare_prefecture",
          "etablissement_gestionnaire_type",
          "etablissement_gestionnaire_conventionne",
          "etablissement_gestionnaire_declare_prefecture",
          "etablissement_reference_type",
          "etablissement_reference_conventionne",
          "etablissement_reference_declare_prefecture",
        ],
      },
    ]);
  },

  async down() {
    // But we can't recover deleted documents...
    return Promise.resolve("ok");
  },
};
