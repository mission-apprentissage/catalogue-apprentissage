const { findLastStatutUpdateDate } = require("../src/common/utils/historyUtils");

module.exports = {
  async up(db) {
    const collection = db.collection("formations");
    const cursor = await collection.find({});

    for await (const formation of cursor) {
      const last_statut_update_date = findLastStatutUpdateDate(formation);

      console.log(last_statut_update_date);

      await collection.updateOne(
        { _id: formation._id },
        {
          $set: { last_statut_update_date },
        }
      );
    }
  },

  async down(db) {
    const collection = db.collection("formations");
    collection.updateMany(
      {},
      {
        $unset: { last_statut_update_date: 1 },
      }
    );
  },
};
