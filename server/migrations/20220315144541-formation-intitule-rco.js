module.exports = {
  async up(db) {
    const formations = db.collection("formations");
    const rcoFormations = db.collection("rcoformations");

    for await (const rcoFormation of rcoFormations.find()) {
      console.log(`${rcoFormation.cle_ministere_educatif} -> ${rcoFormation.intitule_formation}`);
      await formations.updateMany(
        { cle_ministere_educatif: rcoFormation.cle_ministere_educatif },
        { $set: { intitule_rco: rcoFormation.intitule_formation } }
      );
    }
  },

  async down(db) {
    const formations = db.collection("formations");
    await formations.updateMany({}, [{ $unset: ["intitule_rco"] }]);
  },
};
