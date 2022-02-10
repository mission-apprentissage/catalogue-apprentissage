const { isValideUAI } = require("@mission-apprentissage/tco-service-node");

module.exports = {
  async up(db) {
    await (async () => {
      console.info("Checking for UAI in etablissements collection...");
      let count = 0;
      const etablissementCollection = db.collection("etablissements");
      const cursor = await etablissementCollection.find({});

      for await (const etablissement of cursor) {
        const uai_valide = !etablissement.uai || (await isValideUAI(etablissement.uai));
        !uai_valide && console.log(`❌ ${etablissement.uai}`);
        !uai_valide && count++;
        await etablissementCollection.updateOne(
          { _id: etablissement._id },
          {
            $set: {
              uai_valide,
            },
          }
        );
      }
      console.info(`${count} UAI not valid !`);
      console.info("Checking for UAI in etablissements collection: 🆗");
    })();

    await (async () => {
      console.info("Checking for UAI in formations collection...");
      let count = 0;
      const formationCollection = db.collection("formations");
      const cursor = await formationCollection.find({});

      for await (const formation of cursor) {
        const uai_formation_valide = !formation.uai_formation || (await isValideUAI(formation.uai_formation));
        !uai_formation_valide && console.log(`❌ ${formation.uai_formation}`);
        !uai_formation_valide && count++;
        await formationCollection.updateOne(
          { _id: formation._id },
          {
            $set: {
              uai_formation_valide,
            },
          }
        );
      }
      console.info(`${count} UAI not valid !`);
      console.info("Checking for UAI in formations collection: 🆗");
    })();
  },

  async down(db) {
    console.info("Remove uai_valide from etablissements collection.");
    const etablissementCollection = db.collection("etablissements");
    await etablissementCollection.updateMany({}, { $unset: { uai_valide: 1 } });

    console.info("Remove uai_formation_valide from formations collection.");
    const formationCollection = db.collection("formations");
    await formationCollection.updateMany({}, { $unset: { uai_formation_valide: 1 } });
  },
};
