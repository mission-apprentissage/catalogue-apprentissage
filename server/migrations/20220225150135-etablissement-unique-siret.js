module.exports = {
  async up(db) {
    const etablissements = db.collection("etablissements");

    console.log("Etablissements dupliqués :");
    for await (const etablissement of etablissements.aggregate([
      { $group: { _id: "$siret", count: { $sum: 1 } } },
      { $match: { _id: { $ne: null }, count: { $gt: 1 } } },
      { $project: { siret: "$_id", _id: 0 } },
    ])) {
      console.log(etablissement);
    }

    // await collection.dropIndex("siret_1");
    // await collection.createIndex({ siret: 1 }, { unique: true });
  },

  async down() {
    // const collection = db.collection("etablissements");
    // await collection.dropIndex("siret_1");
    // await collection.createIndex({ siret: 1 });
  },
};
