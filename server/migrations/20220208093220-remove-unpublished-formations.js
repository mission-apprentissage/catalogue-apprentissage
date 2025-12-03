module.exports = {
  async up(db) {
    const collection = db.collection("formations");

    const count = await collection.countDocuments({ published: false });

    console.log(`Suppression de ${count} formations archivées`);

    await collection.deleteMany({ published: false });
  },

  async down() {
    // But we can't recover deleted documents...
    return Promise.resolve("ok");
  },
};
