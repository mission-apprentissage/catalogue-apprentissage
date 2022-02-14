module.exports = {
  async up(db) {
    const collection = db.collection("parcoursupformations");
    await collection.updateMany({}, { $unset: { statuts_history: 1 } });
  },

  async down() {
    // can't restore previous state
    return Promise.resolve("ok");
  },
};
