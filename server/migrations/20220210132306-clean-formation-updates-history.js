module.exports = {
  async up(db) {
    const collection = db.collection("formations");

    const cursor = await collection.find({});

    for await (const formation of cursor) {
      // keep only user changes
      await collection.updateOne(
        { _id: formation._id },
        {
          $set: { updates_history: formation.updates_history.filter(({ to }) => !!to?.last_update_who) },
        }
      );
    }
  },

  async down() {
    // can't restore previous state
    return Promise.resolve("ok");
  },
};
