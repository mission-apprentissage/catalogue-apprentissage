module.exports = {
  async up(db) {
    const collection = db.collection("consumptions");
    await collection.createIndex({ method: 1, route: 1 }, { unique: true });
  },

  async down(db) {
    const collection = db.collection("consumptions");
    await collection.dropIndex("method_1_route_1");
  },
};
