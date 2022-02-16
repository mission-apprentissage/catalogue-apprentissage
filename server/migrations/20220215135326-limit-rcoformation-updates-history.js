module.exports = {
  async up(db) {
    const collection = db.collection("rcoformations");

    // keep only the last 100 elements in history
    await collection.updateMany(
      {},
      {
        $push: {
          updates_history: {
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
