module.exports = {
  async up(db, client) {
    await db.collection("roles").insertOne({
      name: "instructeur-affelnet",
      acl: [
        "page_catalogue",
        "page_catalogue/voir_status_publication_aff",
        "page_catalogue/voir_filtres_aff",
        "page_console",
        "page_console/affelnet",
        "page_organismes",
        "page_organisme",
        "page_formation",
        "page_formation/voir_status_publication_aff",
        "page_formation/gestion_publication",
        "page_formation/modifier_informations",
      ],
    });

    await db.collection("roles").insertOne({
      name: "instructeur-parcoursup",
      acl: [
        "page_catalogue",
        "page_catalogue/voir_status_publication_ps",
        "page_catalogue/voir_filtres_ps",
        "page_formation",
        "page_formation/voir_status_publication_ps",
        "page_formation/gestion_publication",
        "page_formation/modifier_informations",
        "page_organismes",
        "page_organisme",
        "page_console",
        "page_console/parcoursup",
      ],
    });

    const instructeurs = await db.collection("users").find({ roles: "instructeur" }).toArray();

    await Promise.all(
      instructeurs?.map(async (instructeur) => {
        await db.collection("users").updateOne(
          { _id: instructeur._id },
          {
            $addToSet: {
              roles: {
                $each: [
                  ...new Set([
                    ...(instructeur.tag?.toLowerCase().includes("affelnet") ? ["instructeur-affelnet"] : []),
                    ...(instructeur.tag?.toLowerCase().includes("parcoursup") ? ["instructeur-parcoursup"] : []),
                    ...(!instructeur.tag?.toLowerCase().includes("parcoursup") &&
                    !instructeur.tag?.toLowerCase().includes("affelnet")
                      ? ["instructeur-parcoursup", "instructeur-affelnet"]
                      : []),
                  ]),
                ],
              },
            },
          }
        );

        await db.collection("users").updateOne(
          { _id: instructeur._id },
          {
            $pull: {
              roles: "instructeur",
            },
          }
        );
      })
    );

    await db.collection("roles").deleteOne({
      name: "instructeur",
    });
  },

  async down(db, client) {
    await db.collection("roles").insertOne({
      name: "instructeur",
      acl: [
        "page_catalogue",
        "page_catalogue/export_btn",
        "page_catalogue/guide_reglementaire",
        "page_catalogue/demande_ajout",
        "page_catalogue/voir_status_publication_ps",
        "page_catalogue/voir_status_publication_aff",
        "page_formation",
        "page_formation/voir_status_publication_ps",
        "page_formation/voir_status_publication_aff",
        "page_formation/modifier_informations",
        "page_formation/supprimer_formation",
        "page_organismes",
        "page_organismes/export_btn",
        "page_organismes/guide_reglementaire",
        "page_organisme",
        "page_organisme/modifier_informations",
        "page_organisme/demandes_corretions",
        "page_catalogue/voir_status_publication",
        "page_formation/gestion_publication",
        "page_console",
        "page_console/affelnet",
        "page_console/parcoursup",
      ],
    });

    const instructeurs = await db
      .collection("users")
      .find({ roles: { $in: ["instructeur-parcoursup", "instructeur-affelnet"] } })
      .toArray();

    await Promise.all(
      instructeurs?.map(async (instructeur) => {
        await db.collection("users").updateOne(
          { _id: instructeur._id },
          {
            $addToSet: {
              roles: "instructeur",
            },
          }
        );

        await db.collection("users").updateOne(
          { _id: instructeur._id },
          {
            $pull: {
              roles: { $in: ["instructeur-parcoursup", "instructeur-affelnet"] },
            },
          }
        );
      })
    );

    await db.collection("roles").deleteOne({
      name: "instructeur-affelnet",
    });
    await db.collection("roles").deleteOne({
      name: "instructeur-parcoursup",
    });
  },
};
