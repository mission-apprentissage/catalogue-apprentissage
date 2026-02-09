const { extractPeriodeArray } = require("../src/common/utils/rcoUtils");

module.exports = {
  async up(db) {
    const formations = db.collection("formations");

    for await (const formation of formations.find({})) {
      await formations.updateOne(
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
    const formations = db.collection("formations");

    for await (const formation of formations.find({})) {
      await formations.updateOne(
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
