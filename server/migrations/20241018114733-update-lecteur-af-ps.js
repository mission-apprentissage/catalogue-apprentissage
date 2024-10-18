module.exports = {
  async up(db, client) {
    const lecteurs = await db.collection("users").find({ roles: "Lecteur" }).toArray();

    await Promise.all(
      lecteurs?.map(async (lecteur) => {
        await db.collection("users").updateOne(
          { _id: lecteur._id },
          {
            $addToSet: {
              roles: {
                $each: ["lecteur-parcoursup", "lecteur-affelnet"],
              },
            },
          }
        );

        await db.collection("users").updateOne(
          { _id: lecteur._id },
          {
            $pull: {
              roles: "Lecteur",
            },
          }
        );
      })
    );

    await db.collection("roles").deleteOne({
      name: "Lecteur",
    });
  },

  async down(db, client) {
    return Promise.resolve("ok");
  },
};
