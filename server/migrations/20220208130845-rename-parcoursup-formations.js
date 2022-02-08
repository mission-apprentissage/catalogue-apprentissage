module.exports = {
  async up(db) {
    const collection = db.collection("psformations");
    await collection.rename("parcoursupformations", { dropTarget: true });
  },

  async down(db) {
    const collection = db.collection("parcoursupformations");
    await collection.rename("psformations", { dropTarget: true });
  },
};
