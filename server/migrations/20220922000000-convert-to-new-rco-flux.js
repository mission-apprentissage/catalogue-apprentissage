module.exports = {
  async up(db) {
    await db.collection("rcoFormations").drop();

    const formations = db.collection("formations");
    await formations.updateMany({}, [
      {
        $unset: "rco_published",
      },
    ]);
  },

  async down() {
    // can't restore previous state
    return Promise.resolve("ok");
  },
};
