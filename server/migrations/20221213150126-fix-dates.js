module.exports = {
  async up(db) {
    await db.collection("dualControlReports").updateMany({ date: { $exists: true } }, [
      {
        $addFields: {
          date: {
            $convert: {
              input: "$date",
              to: "date",
              onError: null,
              onNull: null,
            },
          },
        },
      },
    ]);

    await db.collection("reports").updateMany({ date: { $exists: true } }, [
      {
        $addFields: {
          date: {
            $convert: {
              input: "$date",
              to: "date",
              onError: null,
              onNull: null,
            },
          },
        },
      },
    ]);

    await db.collection("formations").updateMany({ affelnet_published_date: { $exists: true } }, [
      {
        $addFields: {
          affelnet_published_date: {
            $convert: {
              input: "$affelnet_published_date",
              to: "date",
              onError: null,
              onNull: null,
            },
          },
        },
      },
    ]);

    await db.collection("formations").updateMany({ parcoursup_published_date: { $exists: true } }, [
      {
        $addFields: {
          parcoursup_published_date: {
            $convert: {
              input: "$parcoursup_published_date",
              to: "date",
              onError: null,
              onNull: null,
            },
          },
        },
      },
    ]);

    await db.collection("formations").updateMany({}, [
      {
        $addFields: {
          parcoursup_export_date: {
            $convert: {
              input: "$parcoursup_published_date",
              to: "date",
              onError: null,
              onNull: null,
            },
          },
        },
      },
    ]);
  },

  async down() {
    return Promise.resolve("ok");
  },
};
