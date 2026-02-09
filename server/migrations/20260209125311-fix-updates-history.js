const { flatMap } = require("lodash");
const { isArray } = require("lodash");

module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});

    const regleperimetres = db.collection("regleperimetres");
    const etablissements = db.collection("etablissements");
    const formations = db.collection("formations");

    console.log("REGLES ============");
    for await (const item of regleperimetres.find()) {
      if (item.updates_history.filter((h) => isArray(h))?.length) {
        console.log(item._id);
        // console.log(item.updates_history);
        // console.log(flatMap(item.updates_history));
        await regleperimetres.updateOne(
          { _id: item._id },
          { $set: { updates_history: flatMap(item.updates_history) } }
        );
      }
    }

    console.log("ETABLISSEMENTS ============");
    for await (const item of etablissements.find()) {
      if (item.updates_history.filter((h) => isArray(h))?.length) {
        console.log(item._id);
        // console.log(item.updates_history);
        // console.log(flatMap(item.updates_history));
        await formations.updateOne({ _id: item._id }, { $set: { updates_history: flatMap(item.updates_history) } });
      }
    }

    console.log("FORMATIONS ============");
    for await (const item of formations.find()) {
      if (item.updates_history.filter((h) => isArray(h))?.length) {
        console.log(item._id);
        // console.log(item.updates_history);
        // console.log(flatMap(item.updates_history));
        await formations.updateOne({ _id: item._id }, { $set: { updates_history: flatMap(item.updates_history) } });
      }
    }
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
