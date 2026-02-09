const { DateTime } = require("luxon");

module.exports = {
  async up(db) {
    const formations = db.collection("formations");

    for await (const formation of formations.find()) {
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
    const formations = db.collection("formations");

    for await (const formation of formations.find()) {
      if (formation.rncp_details) {
        await formations.updateOne(
          { _id: formation._id },
          {
            $set: {
              "rncp_details.date_fin_validite_enregistrement": formation.rncp_details.date_fin_validite_enregistrement
                ? new Date(formation.rncp_details.date_fin_validite_enregistrement).toLocaleDateString("fr-FR")
                : null,
            },
          }
        );
      }
    }
  },
};
