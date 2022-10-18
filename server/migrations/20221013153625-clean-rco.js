module.exports = {
  async up(db) {
    await db.collection("consolestats").drop();
    await db.collection("affelnetformations").drop();
    await db.collection("parcoursupformations").drop();
    await db.collection("parcoursupformationchecks").drop();
    await db.collection("previousseasonformations").drop();
    await db.collection("previousseasonformationstats").drop();
    await db.collection("regleperimetres").drop();
    await db.collection("dualcontrolperimeterreports").drop();

    const formations = db.collection("formations");
    await formations.updateMany({}, [
      {
        $unset: [
          "affelnet_code_nature",
          "affelnet_infos_offre",
          "affelnet_mefs_10",
          "affelnet_perimetre",
          "affelnet_published_date",
          "affelnet_raison_depublication",
          "affelnet_secteur",
          "affelnet_statut_history",
          "affelnet_statut",
          "forced_published",
          "last_status",
          "last_statut_update_date",
          "parcoursup_error",
          "parcoursup_id",
          "parcoursup_mefs_10",
          "parcoursup_perimetre",
          "parcoursup_published_date",
          "parcoursup_raison_depublication",
          "parcoursup_statut_history",
          "parcoursup_statut",
          "rejection",
        ],
      },
    ]);

    const users = db.collection("users");
    await users.deleteMany({
      isAdmin: false,
    });
  },

  async down() {
    return Promise.resolve("ok");
  },
};
