module.exports = {
  async up(db) {
    const formations = db.collection("formations");

    console.log("Table `formations` : Clé ministère éducatif dupliquées :");
    for await (const formation of formations.aggregate([
      { $group: { _id: "$cle_ministere_educatif", count: { $sum: 1 } } },
      { $match: { _id: { $ne: null }, count: { $gt: 1 } } },
      { $project: { cle_ministere_educatif: "$_id", _id: 0 } },
    ])) {
      console.log(foramtion);
    }

    await formations.dropIndex("cle_ministere_educatif_1");
    await formations.createIndex({ cle_ministere_educatif: 1 }, { unique: true });

    // const rcoformationsCollection = db.collection("rcoformations");

    // const rcoformationCursor = await rcoformationsCollection.aggregate([
    //   { $group: { _id: "$cle_ministere_educatif", count: { $sum: 1 } } },
    //   { $match: { _id: { $ne: null }, count: { $gt: 1 } } },
    //   { $project: { cle_ministere_educatif: "$_id", _id: 0 } },
    // ]);

    // console.log("Table `rcoformations` : Clé ministère éducatif dupliquées :");
    // for await (const rcoFormation of rcoformationCursor) {
    //   console.log(rcoFormation);
    // }

    // await rcoformationsCollection.dropIndex("cle_ministere_educatif_1");
    // await rcoformationsCollection.createIndex({ cle_ministere_educatif: 1 }, { unique: true });
  },

  async down(db) {
    // const rcoformationCollection = db.collection("rcoformations");
    // await rcoformationCollection.dropIndex("cle_ministere_educatif_1");
    // await rcoformationCollection.createIndex({ cle_ministere_educatif: 1 });

    const formations = db.collection("formations");
    await formations.dropIndex("cle_ministere_educatif_1");
    await formations.createIndex({ cle_ministere_educatif: 1 });
  },
};
