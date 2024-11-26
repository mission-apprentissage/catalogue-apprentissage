// Transformation de toutes les occurrences de "en attente de publication" en "prêt pour intégration"
module.exports = {
  async up(db) {
    const formations = db.collection("formations");

    // Mise à jour du statut des formations
    console.log("Mise à jour du statut des formations");
    await formations.updateMany(
      { parcoursup_statut: "en attente de publication" },
      { $set: { parcoursup_statut: "prêt pour intégration" } }
    );
    await formations.updateMany(
      { affelnet_statut: "en attente de publication" },
      { $set: { affelnet_statut: "prêt pour intégration" } }
    );

    // Mise à jour du précédent statut des formations
    console.log("Mise à jour du précédent statut des formations");
    await formations.updateMany(
      { parcoursup_previous_statut: "en attente de publication" },
      { $set: { parcoursup_previous_statut: "prêt pour intégration" } }
    );
    await formations.updateMany(
      { affelnet_previous_statut: "en attente de publication" },
      { $set: { affelnet_previous_statut: "prêt pour intégration" } }
    );

    // Mise à jour de l'historique des statuts des formations
    console.log("Mise à jour de l'historique des statuts des formations");
    await formations.updateMany(
      { "parcoursup_statut_history.parcoursup_statut": "en attente de publication" },
      { $set: { "parcoursup_statut_history.$[e].parcoursup_statut": "prêt pour intégration" } },
      {
        arrayFilters: [{ "e.parcoursup_statut": "en attente de publication" }],
      }
    );
    await formations.updateMany(
      { "affelnet_statut_history.affelnet_statut": "en attente de publication" },
      { $set: { "affelnet_statut_history.$[e].affelnet_statut": "prêt pour intégration" } },
      {
        arrayFilters: [{ "e.affelnet_statut": "en attente de publication" }],
      }
    );
    // Mise à jour de l'historique des formations
    console.log("Mise à jour de l'historique des formations");
    await formations.updateMany(
      { "updates_history.from.parcoursup_statut": "en attente de publication" },
      {
        $set: { "updates_history.$[e].from.parcoursup_statut": "prêt pour intégration" },
      },
      {
        arrayFilters: [{ "e.from.parcoursup_statut": "en attente de publication" }],
      }
    );
    await formations.updateMany(
      { "updates_history.to.parcoursup_statut": "en attente de publication" },
      {
        $set: { "updates_history.$[e].to.parcoursup_statut": "prêt pour intégration" },
      },
      {
        arrayFilters: [{ "e.to.parcoursup_statut": "en attente de publication" }],
      }
    );
    await formations.updateMany(
      { "updates_history.from.affelnet_statut": "en attente de publication" },
      {
        $set: { "updates_history.$[e].from.affelnet_statut": "prêt pour intégration" },
      },
      {
        arrayFilters: [{ "e.from.affelnet_statut": "en attente de publication" }],
      }
    );
    await formations.updateMany(
      { "updates_history.to.affelnet_statut": "en attente de publication" },
      {
        $set: { "updates_history.$[e].to.affelnet_statut": "prêt pour intégration" },
      },
      {
        arrayFilters: [{ "e.to.affelnet_statut": "en attente de publication" }],
      }
    );

    const reglesPerimetres = db.collection("regleperimetres");
    // Mise à jour des règles de périmètre
    console.log("Mise à jour des règles de périmètre");
    await reglesPerimetres.updateMany(
      { statut: "en attente de publication" },
      { $set: { statut: "prêt pour intégration" } }
    );
    // Mise à jour de l'historique des règles de périmètre
    console.log("Mise à jour de l'historique des règles de périmètre");
    await reglesPerimetres.updateMany(
      { "updates_history.from.statut": "en attente de publication" },
      {
        $set: { "updates_history.$[e].from.statut": "prêt pour intégration" },
      },
      {
        arrayFilters: [{ "e.from.statut": "en attente de publication" }],
      }
    );
    await reglesPerimetres.updateMany(
      { "updates_history.to.statut": "en attente de publication" },
      {
        $set: { "updates_history.$[e].to.statut": "prêt pour intégration" },
      },
      {
        arrayFilters: [{ "e.to.statut": "en attente de publication" }],
      }
    );

    const previousSeasonFormations = db.collection("previousseasonformations");
    // Mise à jour des formations de la saison précédente
    console.log("Mise à jour des formations de la saison précédente");
    await previousSeasonFormations.updateMany(
      { parcoursup_statut: "en attente de publication" },
      { $set: { parcoursup_statut: "prêt pour intégration" } }
    );
    await previousSeasonFormations.updateMany(
      { affelnet_statut: "en attente de publication" },
      { $set: { affelnet_statut: "prêt pour intégration" } }
    );
  },

  async down() {
    return Promise.resolve("ok");
  },
};
