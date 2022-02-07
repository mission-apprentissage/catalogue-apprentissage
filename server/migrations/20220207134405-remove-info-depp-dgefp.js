module.exports = {
  async up(db) {
    const collection = db.collection("etablissements");

    console.log(`Removing info_depp, info_depp_info, info_dgefp, info_dgefp_info fields`);

    await collection.updateMany({}, [{ $unset: ["info_depp", "info_depp_info", "info_dgefp", "info_dgefp_info"] }]);
  },

  async down() {
    // But we can't recover deleted documents...
    return Promise.resolve("ok");
  },
};
