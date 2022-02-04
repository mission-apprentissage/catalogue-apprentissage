const mongoose = require("mongoose");

module.exports = {
  async up(db) {
    const collectionPSFormations = db.collection("psformations");
    const collectionFormations = db.collection("formations");

    const cursor = await collectionPSFormations.find({ statut_reconciliation: "VALIDE" });

    for await (const psFormation of cursor) {
      const { id_parcoursup, validated_formation_ids } = psFormation;

      if (validated_formation_ids?.length > 0) {
        // set parcoursup_id only for validated match
        for (const _id of validated_formation_ids) {
          await collectionFormations.updateOne(
            { _id: new mongoose.Types.ObjectId(_id) },
            {
              $set: {
                parcoursup_id: id_parcoursup,
              },
            }
          );
        }
      }
    }
  },

  async down() {
    // can't restore previous state
    return Promise.resolve("ok");
  },
};
