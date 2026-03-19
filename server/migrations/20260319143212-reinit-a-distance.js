module.exports = {
  async up(db) {
    console.log("REINIT FORMATION A DISTANCE PSUP ====================");

    const formations = db.collection("formations");

    for await (const item of formations.find({
      published: true,
      parcoursup_perimetre: true,
      cle_ministere_educatif: /#LAD$/,
      parcoursup_statut: { $eq: "non publié" },
    })) {
      console.log(item.cle_ministere_educatif, item.parcoursup_statut_initial);

      console.log(
        await formations.updateOne(
          { _id: item._id },
          {
            $set: {
              parcoursup_statut: item.parcoursup_statut_initial,
            },
          }
        )
      );
    }
  },

  async down() {},
};
