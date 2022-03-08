module.exports = {
  async up(db) {
    await db.collection("messagescripts").rename("alerts");
  },

  async down(db) {
    await db.collection("alerts").rename("messagescripts");
  },
};
