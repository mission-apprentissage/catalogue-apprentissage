const { findLastStatutUpdateDate } = require("../src/common/utils/historyUtils");

module.exports = {
  async up(db) {
    const formations = db.collection("formations");

    for await (const formation of formations.find()) {
      const last_statut_update_date = findLastStatutUpdateDate(formation);

      console.log(last_statut_update_date);

      await formations.updateOne(
        { _id: formation._id },
        {
          $set: { last_statut_update_date },
        }
      );
    }
  },

  async down(db) {
    const formations = db.collection("formations");
    formations.updateMany(
      {},
      {
        $unset: { last_statut_update_date: 1 },
      }
    );
  },
};
