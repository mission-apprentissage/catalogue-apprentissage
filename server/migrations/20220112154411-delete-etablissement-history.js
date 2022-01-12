module.exports = {
  async up(db) {
    const collection = db.collection("etablissements");
    await collection.updateMany({}, { $set: { updates_history: [] } });
  },

  async down() {
    // But we can't recover deleted documents...
    return Promise.resolve("ok");
  },
};
