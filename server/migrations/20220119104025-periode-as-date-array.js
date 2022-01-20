const { extractPeriodeArray } = require("../src/common/utils/rcoUtils");

module.exports = {
  async up(db) {
    const collection = db.collection("formations");
    const cursor = await collection.find({});

    for await (const formation of cursor) {
      await collection.updateOne(
        { _id: formation._id },
        {
          $set: {
            periode: extractPeriodeArray(JSON.parse(formation.periode ?? "[]")).map((dateStr) => new Date(dateStr)),
          },
        }
      );
    }
  },

  async down(db) {
    const collection = db.collection("formations");
    const cursor = await collection.find({});

    for await (const formation of cursor) {
      await collection.updateOne(
        { _id: formation._id },
        {
          $set: {
            periode: `[${(formation.periode ?? [])
              .map((date) => `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`)
              .reduce((acc, e) => `${acc}${acc ? ", " : ""}"${e}"`, "")}]`,
          },
        }
      );
    }
  },
};
