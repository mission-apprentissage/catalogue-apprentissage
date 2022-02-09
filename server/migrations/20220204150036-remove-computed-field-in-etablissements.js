module.exports = {
  async up(db) {
    const collection = db.collection("etablissements");

    console.log(`Removing computed_type, computed_declare_prefecture, computed_conventionne fields`);

    await collection.updateMany({}, [
      { $unset: ["computed_type", "computed_declare_prefecture", "computed_conventionne"] },
    ]);
  },

  async down() {
    // But we can't recover deleted documents...
    return Promise.resolve("ok");
  },
};
