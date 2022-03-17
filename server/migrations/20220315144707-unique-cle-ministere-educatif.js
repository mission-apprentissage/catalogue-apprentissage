module.exports = {
  async up(db) {
    const formationCollection = db.collection("formations");

    const formationCursor = await formationCollection.aggregate([
      { $group: { _id: "$cle_ministere_educatif", count: { $sum: 1 } } },
      { $match: { _id: { $ne: null }, count: { $gt: 1 } } },
      { $project: { cle_ministere_educatif: "$_id", _id: 0 } },
    ]);

    console.log("Table `formations` : Clé ministère éducatif dupliquées :");
    for await (const rcoFormation of formationCursor) {
      console.log(rcoFormation);
    }

    await formationCollection.dropIndex("cle_ministere_educatif_1");
    await formationCollection.createIndex({ cle_ministere_educatif: 1 }, { unique: true });

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

    const formationCollection = db.collection("formations");
    await formationCollection.dropIndex("cle_ministere_educatif_1");
    await formationCollection.createIndex({ cle_ministere_educatif: 1 });
  },
};
