module.exports = {
  async up(db) {
    const formations = db.collection("formations");

    for await (const formation of formations.find()) {
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
