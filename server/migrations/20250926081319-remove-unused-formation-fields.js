module.exports = {
  async up(db, client) {
    console.log("Updating histories collection...");

    const histories = db.collection("histories");

    await histories.updateMany({ collectionName: "formation" }, [
      {
        $unset: [
          "diff.onisep_libelle_poursuite",
          "diff.france_competence_infos",
          "diff.onisep_lien_site_onisepfr",

          "diff.num_tel",
          "diff.objectif",
          "diff.contenu",

          "diff.rncp_details.demande",
          "diff.rncp_details.nsf_libelle",
          "diff.rncp_details.blocs_competences",
          "diff.rncp_details.voix_acces",
        ],
      },
    ]);

    await histories.updateMany({ collectionName: "formation", "diff.rncp_details": { $eq: {} } }, [
      {
        $unset: ["diff.rncp_details"],
      },
    ]);

    await histories.deleteMany({ collectionName: "formation", diff: { $eq: {} } });

    console.log("Updating formations collection...");

    const formations = db.collection("formations");

    await formations.updateMany(
      {},
      {
        $unset: {
          onisep_libelle_poursuite: "",
          france_competence_infos: "",
          onisep_lien_site_onisepfr: "",
          "rncp_details.demande": "",
          "rncp_details.nsf_libelle": "",
          "rncp_details.blocs_competences": "",
          "rncp_details.voix_acces": "",
          num_tel: "",
          objectif: "",
          contenu: "",
        },
      }
    );
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
