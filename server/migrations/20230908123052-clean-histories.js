module.exports = {
  async up(db) {
    const histories = db.collection("histories");

    await histories.updateMany({ collectionName: "formation" }, [
      {
        $unset: [
          "diff.updates_history",
          "diff.updated_at",
          "diff.affelnet_statut_history",
          "diff.parcoursup_statut_history",
          "diff.lieu_formation_adresse_computed",
          "diff.onisep_discipline",
          "diff.onisep_domaine_sousdomaine",
          "diff.onisep_intitule",
          "diff.onisep_libelle_poursuite",
          "diff.france_competence_infos",
          "diff.onisep_lien_site_onisepfr",
          "diff.onisep_url",

          "diff.rncp_details.demande",
          "diff.rncp_details.nsf_code",
          "diff.rncp_details.nsf_libelle",
          "diff.rncp_details.romes",
          "diff.rncp_details.blocs_competences",
          "diff.rncp_details.voix_acces",
        ],
      },
    ]);

    await histories.deleteMany({ collectionName: "formation", diff: { $eq: {} } });
  },

  async down() {
    return Promise.resolve("ok");
  },
};
