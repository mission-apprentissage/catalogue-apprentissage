module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});

    const users = db.collection("users");

    await users.updateMany({ tag: "Educ" }, { $set: { tag_1: "SAIO Education", tag_2: null } });
    await users.updateMany({ tag: "Agri" }, { $set: { tag_1: "SRFD Agriculture", tag_2: null } });

    await users.updateMany({ tag: "Technique ministère sports" }, { $set: { tag_1: "Sports", tag_2: null } });

    await users.updateMany({ tag: "Technique Dgesco" }, { $set: { tag_1: "Autre", tag_2: "Dgesco/A1-4" } });
    await users.updateMany({ tag: "Technique DNE" }, { $set: { tag_1: "Autre", tag_2: "DNE" } });
    await users.updateMany({ tag: "Technique DNE-Nancy" }, { $set: { tag_1: "Autre", tag_2: "DNE/Nancy" } });
    await users.updateMany({ tag: "Technique IJ" }, { $set: { tag_1: "Autre", tag_2: "InserJeunes" } });
    await users.updateMany(
      { tag: "Technique LBA (utilisateur API)" },
      { $set: { tag_1: "Autre", tag_2: "DGEFP/LBA" } }
    );
    await users.updateMany({ tag: "Technique Moss" }, { $set: { tag_1: "Autre", tag_2: "Dgesip/Moss" } });
    await users.updateMany({ tag: "Technique RCO" }, { $set: { tag_1: "Autre", tag_2: "RCO" } });
    await users.updateMany({ tag: "Technique SCN" }, { $set: { tag_1: "Autre", tag_2: "SCN/Parcoursup" } });

    await users.updateMany({ tag_1: { $exists: false } }, { $set: { tag_1: "Autre", tag_2: null } });
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
