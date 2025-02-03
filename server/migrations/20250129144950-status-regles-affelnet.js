module.exports = {
  async up(db) {
    await db
      .collection("regleperimetres")
      .updateMany({ plateforme: "affelnet", statut: "à publier (soumis à validation)" }, [
        {
          $set: {
            statut: "à définir",
          },
        },
      ]);
  },

  async down(db) {
    await db.collection("regleperimetres").updateMany({ plateforme: "affelnet", statut: "à définir" }, [
      {
        $set: {
          statut: "à publier (soumis à validation)",
        },
      },
    ]);
  },
};
