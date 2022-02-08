module.exports = {
  async up(db) {
    const collection = db.collection("afformations");
    await collection.rename("affelnetformations", { dropTarget: true });
  },

  async down(db) {
    const collection = db.collection("affelnetformations");
    await collection.rename("afformations", { dropTarget: true });
  },
};
