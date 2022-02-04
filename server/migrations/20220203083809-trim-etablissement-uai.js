module.exports = {
  async up(db) {
    const collection = db.collection("etablissements");

    const uaiWithWhitespace = await collection.count({ uai: / / });
    console.log(`${uaiWithWhitespace} établissements avec un espace dans l'UAI`);

    await collection.updateMany({ uai: / / }, [{ $set: { uai: { $trim: { input: "$uai" } } } }]);
  },

  async down() {
    // Can't recover untrimed uais
    return Promise.resolve("ok");
  },
};
