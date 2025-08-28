module.exports = {
  async up(db) {
    await db.collection("conventionfiles").drop();
    await db.collection("ficherncps").drop();
    await db.collection("oniseps").drop();
  },

  async down() {},
};
