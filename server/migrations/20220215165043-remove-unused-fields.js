module.exports = {
  async up(db) {
    const formations = db.collection("formations");
    await formations.updateMany(
      {},
      {
        $unset: {
          draft: 1,
          to_verified: 1,
          etablissement_formateur_datadock: 1,
          etablissement_reference_datadock: 1,
          etablissement_gestionnaire_datadock: 1,
          mef_10_code: 1,
          mefs_10: 1,
          parcoursup_ids: 1,
          parcoursup_reference: 1,
          parcoursup_a_charger: 1,
          affelnet_reference: 1,
          affelnet_a_charger: 1,
          affelnet_error: 1,
          commentaires: 1,
          source: 1,
        },
      }
    );

    const etablissements = db.collection("etablissements");
    await etablissements.updateMany(
      {},
      {
        $unset: {
          info_datadock: 1,
          info_qualiopi: 1,
          info_datadock_info: 1,
          computed_info_datadock: 1,
          parcoursup_a_charger: 1,
          affelnet_a_charger: 1,
        },
      }
    );
  },

  async down() {
    // can't restore previous state
    return Promise.resolve("ok");
  },
};
