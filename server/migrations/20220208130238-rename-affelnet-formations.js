module.exports = {
  async up(db) {
    const collection = db.collection("afformations");
    await collection.renameCollection("affelnetformations", true);
  },

  async down(db) {
    const collection = db.collection("affelnetformations");
    await collection.renameCollection("afformations", true);
  },
};
