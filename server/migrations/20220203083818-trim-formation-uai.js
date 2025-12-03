module.exports = {
  async up(db) {
    const collection = db.collection("formations");

    const uaiWithWhitespace = await collection.countDocuments({ uai_formation: / / });
    console.log(`${uaiWithWhitespace} formations avec un espace dans l'UAI`);

    await collection.updateMany({ uai_formation: / / }, [
      { $set: { uai_formation: { $trim: { input: "$uai_formation" } } } },
    ]);
  },

  async down() {
    // Can't recover untrimed uais
    return Promise.resolve("ok");
  },
};
