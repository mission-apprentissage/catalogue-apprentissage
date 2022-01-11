module.exports = {
  async up(db) {
    const collection = db.collection("regleperimetres");
    await collection.updateMany({}, [{ $set: { duree: { $toString: "$duree" }, annee: { $toString: "$annee" } } }]);
  },

  async down(db) {
    const collection = db.collection("regleperimetres");
    await collection.updateMany({}, [{ $set: { duree: { $toInt: "$duree" }, annee: { $toInt: "$annee" } } }]);
  },
};
