module.exports = {
  async up(db) {
    await db.collection("etablissements").updateMany(
      { "updates_history.updated_at": { $exists: true } },

      [
        {
          $addFields: {
            updates_history: {
              $map: {
                input: "$updates_history",
                as: "uh",
                in: {
                  $mergeObjects: [
                    "$$uh",
                    {
                      updated_at: {
                        $convert: {
                          input: "$$uh.updated_at",
                          to: "date",
                          onError: null,
                          onNull: null,
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      ]
    );
  },

  async down() {
    return Promise.resolve("ok");
  },
};
