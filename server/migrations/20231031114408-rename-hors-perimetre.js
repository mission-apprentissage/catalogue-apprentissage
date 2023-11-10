// Transformation de toutes les occurrences de "hors périmètre" en "non puliable en l'état"
module.exports = {
  async up(db) {
    const formations = db.collection("formations");

    // Mise à jour du statut des formations
    console.log("Mise à jour du statut des formations");
    await formations.updateMany(
      { parcoursup_statut: "hors périmètre" },
      { $set: { parcoursup_statut: "non puliable en l'état" } }
    );
    await formations.updateMany(
      { affelnet_statut: "hors périmètre" },
      { $set: { affelnet_statut: "non puliable en l'état" } }
    );
    // Mise à jour de l'historique des statuts des formations
    console.log("Mise à jour de l'historique des statuts des formations");
    await formations.updateMany(
      { "parcoursup_statut_history.parcoursup_statut": "hors périmètre" },
      { $set: { "parcoursup_statut_history.$[e].parcoursup_statut": "non puliable en l'état" } },
      {
        arrayFilters: [{ "e.parcoursup_statut": "hors périmètre" }],
      }
    );
    await formations.updateMany(
      { "affelnet_statut_history.affelnet_statut": "hors périmètre" },
      { $set: { "affelnet_statut_history.$[e].affelnet_statut": "non puliable en l'état" } },
      {
        arrayFilters: [{ "e.affelnet_statut": "hors périmètre" }],
      }
    );
    // Mise à jour de l'historique des formations
    console.log("Mise à jour de l'historique des formations");
    await formations.updateMany(
      { "updates_history.from.parcoursup_statut": "hors périmètre" },
      {
        $set: { "updates_history.$[e].from.parcoursup_statut": "non puliable en l'état" },
      },
      {
        arrayFilters: [{ "e.from.parcoursup_statut": "hors périmètre" }],
      }
    );
    await formations.updateMany(
      { "updates_history.to.parcoursup_statut": "hors périmètre" },
      {
        $set: { "updates_history.$[e].to.parcoursup_statut": "non puliable en l'état" },
      },
      {
        arrayFilters: [{ "e.to.parcoursup_statut": "hors périmètre" }],
      }
    );
    await formations.updateMany(
      { "updates_history.from.affelnet_statut": "hors périmètre" },
      {
        $set: { "updates_history.$[e].from.affelnet_statut": "non puliable en l'état" },
      },
      {
        arrayFilters: [{ "e.from.affelnet_statut": "hors périmètre" }],
      }
    );
    await formations.updateMany(
      { "updates_history.to.affelnet_statut": "hors périmètre" },
      {
        $set: { "updates_history.$[e].to.affelnet_statut": "non puliable en l'état" },
      },
      {
        arrayFilters: [{ "e.to.affelnet_statut": "hors périmètre" }],
      }
    );

    const reglesPerimetres = db.collection("regleperimetres");
    // Mise à jour des règles de périmètre
    console.log("Mise à jour des règles de périmètre");
    await reglesPerimetres.updateMany({ statut: "hors périmètre" }, { $set: { statut: "non puliable en l'état" } });
    // Mise à jour de l'historique des règles de périmètre
    console.log("Mise à jour de l'historique des règles de périmètre");
    await reglesPerimetres.updateMany(
      { "updates_history.from.statut": "hors périmètre" },
      {
        $set: { "updates_history.$[e].from.statut": "non puliable en l'état" },
      },
      {
        arrayFilters: [{ "e.from.statut": "hors périmètre" }],
      }
    );
    await reglesPerimetres.updateMany(
      { "updates_history.to.statut": "hors périmètre" },
      {
        $set: { "updates_history.$[e].to.statut": "non puliable en l'état" },
      },
      {
        arrayFilters: [{ "e.to.statut": "hors périmètre" }],
      }
    );

    const previousSeasonFormations = db.collection("previousseasonformations");
    // Mise à jour des formations de la saison précédente
    console.log("Mise à jour des formations de la saison précédente");
    await previousSeasonFormations.updateMany(
      { parcoursup_statut: "hors périmètre" },
      { $set: { parcoursup_statut: "non puliable en l'état" } }
    );
    await previousSeasonFormations.updateMany(
      { affelnet_statut: "hors périmètre" },
      { $set: { affelnet_statut: "non puliable en l'état" } }
    );
  },

  async down() {
    return Promise.resolve("ok");
  },
};
