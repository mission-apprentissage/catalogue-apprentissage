module.exports = {
  async up(db, client) {
    const formations = db.collection("formations");

    console.log(
      await formations.updateMany(
        {
          published: true,
          parcoursup_statut: "non publié",
          cle_me_remplace_par_traitee: { $ne: true },
          parcoursup_raison_depublication: { $ne: "En cours d'arbitrage / contacter la MOSS" },
        },
        {
          $set: { parcoursup_statut: "non publiable en l'état" },
        }
      )
    );

    console.log(
      await formations.updateMany(
        { published: true, affelnet_statut: "non publié", cle_me_remplace_par_traitee: { $ne: true } },
        {
          $set: { affelnet_statut: "non publiable en l'état" },
        }
      )
    );
  },

  async down() {},
};
