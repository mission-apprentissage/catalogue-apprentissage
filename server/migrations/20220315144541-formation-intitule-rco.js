module.exports = {
  async up(db) {
    const formationCollection = db.collection("formations");
    const rcoFormationCollection = db.collection("rcoformations");

    const cursor = await rcoFormationCollection.find({});

    for await (const rcoFormation of cursor) {
      console.log(`${rcoFormation.cle_ministere_educatif} -> ${rcoFormation.intitule_formation}`);
      formationCollection.updateMany(
        { cle_ministere_educatif: rcoFormation.cle_ministere_educatif },
        { $set: { intitule_rco: rcoFormation.intitule_formation } }
      );
    }
  },

  async down(db) {
    const formationCollection = db.collection("formations");
    await formationCollection.updateMany({}, [{ $unset: ["intitule_rco"] }]);
  },
};
