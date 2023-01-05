module.exports = {
  async up(db) {
    const formations = db.collection("formations");
    await formations.updateMany({}, [
      {
        $unset: ["idea_geo_coordonnees_etablissement"],
      },
    ]);
  },

  async down() {
    return Promise.resolve("ok");
  },
};
