module.exports = {
  async up(db, client) {
    const formations = await db.collection("formations");

    formations.updateMany(
      {
        published: true,
        parcoursup_statut: "non publié",
        cle_me_remplace_par_traitee: false,
        parcoursup_raison_depublication: { $ne: "En cours d'arbitrage / contacter la MOSS" },
      },
      {
        $set: { parcoursup_statut: "non publiable en l'état" },
      }
    );

    formations.updateMany(
      { published: true, affelnet_statut: "non publié", cle_me_remplace_par_traitee: false },
      {
        $set: { affelnet_statut: "non publiable en l'état" },
      }
    );
  },

  async down() {},
};
