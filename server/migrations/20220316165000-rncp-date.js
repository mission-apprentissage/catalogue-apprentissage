const { DateTime } = require("luxon");

module.exports = {
  async up(db) {
    const collection = db.collection("formations");
    const cursor = await collection.find({});

    for await (const formation of cursor) {
      if (formation.rncp_details) {
        await collection.updateOne(
          { _id: formation._id },
          {
            $set: {
              "rncp_details.date_fin_validite_enregistrement": formation.rncp_details.date_fin_validite_enregistrement
                ? DateTime.fromFormat(formation.rncp_details.date_fin_validite_enregistrement, "dd/MM/yyyy").toJSDate()
                : null,
            },
          }
        );
      }
    }
  },

  async down(db) {
    const collection = db.collection("formations");
    const cursor = await collection.find({});

    for await (const formation of cursor) {
      if (formation.rncp_details) {
        await collection.updateOne(
          { _id: formation._id },
          {
            $set: {
              "rncp_details.date_fin_validite_enregistrement": formation.rncp_details.date_fin_validite_enregistrement
                ? new Date(formation.rncp_details.date_fin_validite_enregistrement).toLocaleDateString("fr")
                : null,
            },
          }
        );
      }
    }
  },
};
