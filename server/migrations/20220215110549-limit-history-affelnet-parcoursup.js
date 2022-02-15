module.exports = {
  async up(db) {
    const collection = db.collection("formations");

    // keep only the last 200 entries in history (a bit more than 6 month)
    await collection.updateMany(
      {},
      {
        $push: {
          affelnet_statut_history: {
            $each: [],
            $slice: -200,
          },
          parcoursup_statut_history: {
            $each: [],
            $slice: -200,
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
