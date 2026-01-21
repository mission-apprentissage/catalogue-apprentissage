module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});

    //   $pull: {
    // roles: "user",
    // acl: {
    //   $in: [
    //     "page_reconciliation_ps",
    //     "page_reconciliation_ps/validation_rejection",
    //     "page_reconciliation_ps/send_rapport_anomalies",
    //     "page_actions_expertes",
    //   ],
    // },

    const users = db.collection("users");
    const roles = db.collection("roles");

    console.log(
      "Ajout du droit d'édition des règles de périmètre Parcoursup aux rôles précédemment concernés",
      await roles.updateMany(
        { acl: "page_perimetre/parcoursup" },
        {
          $push: { acl: "page_perimetre/parcoursup-edit-rule" },
        }
      ),
      await roles.updateMany(
        { acl: "page_perimetre/parcoursup" },
        {
          $pull: { acl: "page_perimetre/parcoursup" },
        }
      )
    );

    console.log(
      "Ajout du droit d'édition des règles de périmètre Parcoursup aux utilisateurs précédemment concernés",
      await users.updateMany(
        { acl: "page_perimetre/parcoursup" },
        {
          $push: { acl: "page_perimetre/parcoursup-edit-rule" },
        }
      ),
      await users.updateMany(
        { acl: "page_perimetre/parcoursup" },
        {
          $pull: { acl: "page_perimetre/parcoursup" },
        }
      )
    );

    console.log(
      "Ajout du droit d'édition des règles de périmètre Affelnet aux rôles précédemment concernés",
      await roles.updateMany(
        { acl: "page_perimetre/affelnet" },
        {
          $push: { acl: "page_perimetre/affelnet-edit-rule" },
        }
      ),
      await roles.updateMany(
        { acl: "page_perimetre/affelnet" },
        {
          $pull: { acl: "page_perimetre/affelnet" },
        }
      )
    );

    console.log(
      "Ajout du droit d'édition des règles de périmètre Affelnet aux utilisateurs précédemment concernés",
      await users.updateMany(
        { acl: "page_perimetre/affelnet" },
        {
          $push: { acl: "page_perimetre/affelnet-edit-rule" },
        }
      ),
      await users.updateMany(
        { acl: "page_perimetre/affelnet" },
        {
          $pull: { acl: "page_perimetre/affelnet" },
        }
      )
    );

    console.log(
      "Ajout du droit de création des règles de périmètre Parcoursup au rôle MOSS",

      await roles.updateOne(
        { name: "moss" },
        {
          $push: { acl: "page_perimetre/parcoursup-add-rule" },
        }
      )
    );

    console.log(
      "Ajout du droit de création des règles de périmètre Affelnet au rôle DGESCO",
      await roles.updateOne(
        { name: "dgesco" },
        {
          $push: { acl: "page_perimetre/affelnet-add-rule" },
        }
      )
    );
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
