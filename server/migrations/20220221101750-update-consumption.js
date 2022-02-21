module.exports = {
  async up(db) {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);

    const collection = db.collection("consumptions");

    await collection.dropIndex("method_1_route_1");

    await collection.updateMany({}, [
      {
        $set: {
          path: "$route",
          consumers: {
            $map: {
              input: "$consumers",
              in: {
                caller: "$$this.ip",
                callCount: "$$this.callCount",
                date,
              },
            },
          },
        },
      },
      { $unset: ["route"] },
    ]);

    await collection.createIndex({ method: 1, path: 1 }, { unique: true });
  },

  async down(db) {
    const collection = db.collection("consumptions");

    await collection.dropIndex("method_1_path_1");

    await collection.updateMany({}, [
      {
        $set: {
          route: "$path",
          consumers: {
            $map: {
              input: "$consumers",
              in: {
                ip: "$$this.caller",
                callCount: "$$this.callCount",
              },
            },
          },
        },
      },
      { $unset: ["path"] },
    ]);

    await collection.createIndex({ method: 1, route: 1 }, { unique: true });
  },
};
