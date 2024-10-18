module.exports = {
  async up(db) {
    const users = await db.collection("users").find({}).toArray();

    for (const user of users) {
      const tag = user.tag
        ?.split(", ")
        .filter((tag) => !["Parcoursup", "Affelnet", "Candidatures"].includes(tag))
        .join(", ");

      await db.collection("users").updateOne({ _id: user._id }, { $set: { tag } });
    }
  },

  async down() {
    return Promise.resolve("ok");
  },
};
