module.exports = {
  async up(db, client) {
    const CampagneStart = db.collection("campagnestarts");

    await CampagneStart.insertOne({ created_at: new Date("2023-09-17T00:00:00.000Z") });
  },

  async down(db, client) {
    const CampagneStart = db.collection("campagnestarts");

    await CampagneStart.deleteOne({ created_at: new Date("2023-09-17T00:00:00.000Z") });
  },
};
