module.exports = {
  async up(db) {
    const formations = db.collection("formations");
    await formations.updateMany({}, [
      {
        $unset: ["formation_n3", "formation_n4", "formation_n5", "formation_n6", "formation_n7"],
      },
    ]);
  },

  async down() {
    return Promise.resolve("ok");
  },
};
