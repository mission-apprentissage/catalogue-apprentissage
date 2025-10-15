module.exports = {
  async up(db) {
    const formations = db.collection("formations");

    // await formations.updateMany(
    //   {
    //     parcoursup_previous_statut: "non publié",
    //   },
    //   { $set: { parcoursup_statut: "non publiable en l'état", parcoursup_raison_depublication: null } }
    // );

    // await formations.updateMany(
    //   {
    //     affelnet_previous_statut: "non publié",
    //   },
    //   { $set: { affelnet_statut: "non publiable en l'état", affelnet_raison_depublication: null } }
    // );

    const parcoursup_formations = await formations
      .aggregate([
        {
          $match: {
            published: true,
            // parcoursup_statut: { $nin: ["non publié"] },
            parcoursup_previous_statut: "non publié",
            // parcoursup_raison_depublication: null,
            updates_history: {
              $elemMatch: {
                // "to.parcoursup_statut": "non publié",
                "to.parcoursup_raison_depublication": {
                  $exists: true,
                  $ne: null,
                },
                // updated_at: {
                //   $gte: new Date("2023-09-17T00:00:00.000+0000"),
                //   // $lt: new Date("2024-10-04T07:35:38.800+0000"),
                // },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            cle_ministere_educatif: 1,
            parcoursup_statut: 1,
            parcoursup_raison_depublication: 1,
            updates_history: 1,
          },
        },
        {
          $unwind: "$updates_history",
        },
        {
          $match: {
            // "updates_history.to.parcoursup_statut": "non publié",
            "updates_history.to.parcoursup_raison_depublication": {
              $exists: true,
              $ne: null,
            },
            // "updates_history.updated_at": {
            //   $gte: new Date("2023-09-17T00:00:00.000+0000"),
            //   // $lt: new Date("2024-10-04T07:35:38.800+0000"),
            // },
          },
        },
        {
          $group: {
            _id: "$_id",
            cle_ministere_educatif: { $first: "$cle_ministere_educatif" },
            parcoursup_statut: { $first: "$parcoursup_statut" },
            parcoursup_raison_depublication: { $first: "$parcoursup_raison_depublication" },
            updates_history: { $last: "$updates_history" },
          },
        },
      ])
      .toArray();

    console.log({ parcoursup_formations });

    console.log(`Modification de ${parcoursup_formations.length} statut de publication vers Parcoursup`);

    for (formation of parcoursup_formations) {
      const update = await formations.updateOne(
        { _id: formation._id },
        {
          $set: {
            parcoursup_statut: "non publié",
            parcoursup_raison_depublication: formation.updates_history.to.parcoursup_raison_depublication,
          },
        }
      );
      console.log(update);
    }

    const affelnet_formations = await formations
      .aggregate([
        {
          $match: {
            published: true,
            // affelnet_statut: { $nin: ["non publié"] },
            affelnet_previous_statut: "non publié",
            // affelnet_raison_depublication: null,
            updates_history: {
              $elemMatch: {
                // "to.affelnet_statut": "non publié",
                "to.affelnet_raison_depublication": {
                  $exists: true,
                  $ne: null,
                },
                // updated_at: {
                //   $gte: new Date("2023-09-17T00:00:00.000+0000"),
                //   // $lt: new Date("2024-10-04T07:35:38.800+0000"),
                // },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            cle_ministere_educatif: 1,
            affelnet_statut: 1,
            affelnet_raison_depublication: 1,
            updates_history: 1,
          },
        },
        {
          $unwind: "$updates_history",
        },
        {
          $match: {
            // "updates_history.to.affelnet_statut": "non publié",
            "updates_history.to.affelnet_raison_depublication": {
              $exists: true,
              $ne: null,
            },
            // "updates_history.updated_at": {
            //   $gte: new Date("2023-09-17T00:00:00.000+0000"),
            //   // $lt: new Date("2024-10-04T07:35:38.800+0000"),
            // },
          },
        },
        {
          $group: {
            _id: "$_id",
            cle_ministere_educatif: { $first: "$cle_ministere_educatif" },
            affelnet_statut: { $first: "$affelnet_statut" },
            affelnet_raison_depublication: { $first: "$affelnet_raison_depublication" },
            updates_history: { $last: "$updates_history" },
          },
        },
      ])
      .toArray();

    console.log({ affelnet_formations });

    console.log(`Modification de ${affelnet_formations.length} statut de publication vers Affelnet`);

    for (formation of affelnet_formations) {
      const update = await formations.updateOne(
        { _id: formation._id },
        {
          $set: {
            affelnet_statut: "non publié",
            affelnet_raison_depublication: formation.updates_history.to.affelnet_raison_depublication,
          },
        }
      );

      console.log(update);
    }
  },

  async down() {},
};
