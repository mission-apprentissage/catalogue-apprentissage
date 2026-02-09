module.exports = {
  async up(db) {
    const users = await db.collection("users");

    for (const user of users.find({})) {
      const tag = user.tag
        ?.split(", ")
        .filter((tag) => !["Parcoursup", "Affelnet", "Candidatures"].includes(tag))
        .join(", ");

      await users.updateOne({ _id: user._id }, { $set: { tag } });
    }
  },

  async down() {
    return Promise.resolve("ok");
  },
};
