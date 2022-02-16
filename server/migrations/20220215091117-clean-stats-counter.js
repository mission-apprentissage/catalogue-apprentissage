module.exports = {
  async up(db) {
    const collection = db.collection("statistiques");

    const result = await collection.aggregate([
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          source: "$_id",
          _id: 0,
          count: "$count",
        },
      },
    ]);

    for await (const item of result) {
      await collection.insertOne(item);
    }

    await collection.deleteMany({ count: null });
  },

  async down() {
    // can't restore previous state
    return Promise.resolve("ok");
  },
};
