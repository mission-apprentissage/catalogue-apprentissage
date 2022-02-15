module.exports = {
  async up(db) {
    const collection = db.collection("formations");

    // keep only the last 100 entries in history
    await collection.updateMany(
      {},
      {
        $push: {
          affelnet_statut_history: {
            $each: [],
            $slice: -100,
          },
          parcoursup_statut_history: {
            $each: [],
            $slice: -100,
          },
        },
      }
    );
  },

  async down() {
    // can't restore previous state
    return Promise.resolve("ok");
  },
};
