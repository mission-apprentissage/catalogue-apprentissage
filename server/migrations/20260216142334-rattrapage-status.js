module.exports = {
  async up(db, client) {
    /**
     * Suite à problème dans le flux RCO le vendredi 13/02, on a perdu les demandes de publication pour certaines formations.
     * Première chose à faire: récupérer un fichier correct par RCO et lancer les jobs nocturnes pour réimport des données et exécution des scritps de périmètre.
     *
     * Ensuite on vérifie ce qui était "prêt pour intégration" ou "publié" au 12/02, qui ne le sont plus et on les repasse en "prêt pour intégration" à condition que les formations répondent toujours aux critères d'intégration du périmètre.
     */
    const formations = db.collection("formations");
    const currentDate = new Date();

    const lastDate = new Date("2026-02-12");

    console.log({ currentDate, lastDate });

    console.log("AFFELNET ====================");

    for await (const item of formations.find({
      published: true,
      catalogue_published: true,
      affelnet_statut: { $nin: ["prêt pour intégration", "publié", "non publié"] },
      affelnet_session: true,
      affelnet_perimetre: true,
      affelnet_statut_history: {
        $elemMatch: {
          affelnet_statut: { $in: ["prêt pour intégration", "publié"] },
          date: { $gte: lastDate },
        },
      },
    })) {
      console.log(item.cle_ministere_educatif, item.affelnet_statut);

      await formations.updateOne(
        { _id: item._id },
        {
          $set: {
            affelnet_statut: "prêt pour intégration",
            affelnet_statut_history: item.affelnet_statut_history.filter(
              (history) =>
                new Date(history.date)?.getTime() < lastDate.getTime() ||
                ["prêt pour intégration", "publié"].includes(history.affelnet_statut)
            ),
          },
        }
      );
    }

    console.log("PARCOURSUP ====================");

    for await (const item of formations.find({
      published: true,
      catalogue_published: true,
      parcoursup_statut: { $nin: ["prêt pour intégration", "publié", "non publié"] },
      parcoursup_session: true,
      parcoursup_perimetre: true,
      parcoursup_statut_history: {
        $elemMatch: {
          parcoursup_statut: { $in: ["prêt pour intégration", "publié"] },
          date: { $gte: lastDate },
        },
      },
    })) {
      console.log(item.cle_ministere_educatif, item.parcoursup_statut);

      await formations.updateOne(
        { _id: item._id },
        {
          $set: {
            parcoursup_statut: "prêt pour intégration",
            parcoursup_statut_history: item.parcoursup_statut_history.filter(
              (history) =>
                new Date(history.date)?.getTime() < lastDate.getTime() ||
                ["prêt pour intégration", "publié"].includes(history.parcoursup_statut)
            ),
          },
        }
      );
    }
  },

  async down(db, client) {},
};
