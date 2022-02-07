module.exports = {
  async up(db) {
    const collection = db.collection("afformations");
    await collection.updateMany({}, { $unset: { no_uai: 1, etat_reconciliation: 1 } });
  },

  async down() {
    // can't restore previous state
    return Promise.resolve("ok");
  },
};
