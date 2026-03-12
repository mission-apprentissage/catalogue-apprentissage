module.exports = {
  async up(db) {
    /**
     * Suite à problème dans le flux RCO, on a perdu les demandes de publication pour certaines formations.
     * Première chose à faire: récupérer un fichier correct par RCO et lancer les jobs nocturnes pour réimport des données et exécution des scritps de périmètre.
     *
     * Ensuite on vérifie ce qui était "prêt pour intégration" ou "publié" le jour précédent, qui ne le sont plus et on les repasse en "prêt pour intégration" à condition que les formations répondent toujours aux critères d'intégration du périmètre.
     */
    const formations = db.collection("formations");
    const currentDate = new Date();

    const startCampagneDate = new Date("2025-09-31");

    console.log({ currentDate, startCampagneDate });

    console.log("AFFELNET ====================");

    for await (const item of formations.find({
      published: true,
      catalogue_published: true,
      affelnet_perimetre: true,
      affelnet_session: true,
      affelnet_statut: { $in: ["à publier", "à publier (soumis à validation)"] },
      affelnet_statut_history: {
        $elemMatch: {
          affelnet_statut: { $in: ["prêt pour intégration", "publié"] },
          date: { $gte: startCampagneDate },
        },
      },
    })) {
      console.log(item.cle_ministere_educatif, item.affelnet_statut);

      console.log(
        await formations.updateOne(
          { _id: item._id },
          {
            $set: {
              affelnet_statut: "prêt pour intégration",
            },
          }
        )
      );
    }

    console.log("PARCOURSUP ====================");

    for await (const item of formations.find({
      published: true,
      catalogue_published: true,
      parcoursup_perimetre: true,
      parcoursup_session: true,
      parcoursup_statut: {
        $in: [
          "à publier",
          "à publier (vérifier accès direct postbac)",
          "à publier (soumis à validation Recteur)",
          "à publier (sous condition habilitation)",
        ],
      },
      parcoursup_statut_history: {
        $elemMatch: {
          parcoursup_statut: { $in: ["prêt pour intégration", "publié"] },
          date: { $gte: startCampagneDate },
        },
      },
    })) {
      console.log(item.cle_ministere_educatif, item.parcoursup_statut);

      // console.log(
      //   await formations.updateOne(
      //     { _id: item._id },
      //     {
      //       $set: {
      //         parcoursup_statut: "prêt pour intégration",
      //       },
      //     }
      //   )
      // );
    }
  },

  async down() {},
};
