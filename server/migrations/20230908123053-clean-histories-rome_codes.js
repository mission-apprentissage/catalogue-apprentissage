module.exports = {
  async up(db) {
    const histories = db.collection("histories");

    await histories.updateMany({ collectionName: "formation" }, [
      {
        $unset: ["diff.rome_codes"],
      },
    ]);

    await histories.deleteMany({ collectionName: "formation", diff: { $eq: {} } });

    // Run following command to compact collection
    // await db.runCommand({
    //   compact: "histories",
    // });
  },

  async down() {
    return Promise.resolve("ok");
  },
};
