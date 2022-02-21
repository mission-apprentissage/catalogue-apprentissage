const { COMMON_STATUS } = require("../src/constants/status");
const { findPublishedDate } = require("../src/common/utils/historyUtils");

module.exports = {
  async up(db) {
    const collection = db.collection("formations");

    const affelnetCursor = await collection.find({ affelnet_statut: COMMON_STATUS.PUBLIE });
    for await (const formation of affelnetCursor) {
      const publishedDate = findPublishedDate(formation, "affelnet");
      await collection.updateOne(
        { _id: formation._id },
        {
          $set: {
            affelnet_published_date: publishedDate,
          },
        }
      );
    }

    const parcoursupCursor = await collection.find({ parcoursup_statut: COMMON_STATUS.PUBLIE });
    for await (const formation of parcoursupCursor) {
      const publishedDate = findPublishedDate(formation, "parcoursup");
      await collection.updateOne(
        { _id: formation._id },
        {
          $set: {
            parcoursup_published_date: publishedDate,
          },
        }
      );
    }
  },

  async down(db) {
    const collection = db.collection("formations");
    await collection.updateMany(
      {},
      {
        $unset: {
          affelnet_published_date: 1,
          parcoursup_published_date: 1,
        },
      }
    );
  },
};
