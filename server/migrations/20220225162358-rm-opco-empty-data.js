module.exports = {
  async up(db) {
    const collection = db.collection("formations");
    await collection.updateMany({}, [{ $unset: ["opcos", "info_opcos", "info_opcos_intitule"] }]);
  },

  async down() {
    // can't recover deleted fields
    return Promise.resolve("ok");
  },
};
