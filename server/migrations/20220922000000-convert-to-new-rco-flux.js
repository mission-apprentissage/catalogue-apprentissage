module.exports = {
  async up(db) {
    await db.collection("rcoFormations").drop();
    await db.collection("conventionfiles").drop();
    await db.collection("bcnnmefs").drop();
    await db.collection("bcnndispositifformations").drop();
    await db.collection("bcnnniveauformationdiplomes").drop();
    await db.collection("bcnformationdiplomes").drop();
    await db.collection("bcnlettrespecialites").drop();
    await db.collection("bcnmefs").drop();
    await db.collection("ficherncps").drop();
    await db.collection("oniseps").drop();
    await db.collection("sandboxformations").drop();

    const formations = db.collection("formations");
    await formations.updateMany({}, [
      {
        $unset: "rco_published",
      },
      {
        $unset: "to_update",
      },
      {
        $unset: "update_error",
      },
    ]);
  },

  async down() {
    // can't restore previous state
    return Promise.resolve("ok");
  },
};
