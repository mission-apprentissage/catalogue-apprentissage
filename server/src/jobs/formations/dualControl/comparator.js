const { DualControlFormation, DualControlReport } = require("../../../common/model/index");
const { Formation } = require("../../../common/model/index");

// Here list all the fields we want to compare
const FIELDS_TO_COMPARE = ["cfd", "rncp_code", "etablissement_gestionnaire_siret"];

const compare = async (date = Date.now(), fieldsToCompare = FIELDS_TO_COMPARE) => {
  const results = {
    date,
    totalFormation: await Formation.countDocuments({ published: true }),
    totalDualControlFormation: await DualControlFormation.countDocuments({}),
    totalNotFound: 0,
  };

  results.fields = fieldsToCompare.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});

  const dualCursor = DualControlFormation.find({})
    .select(["cle_ministere_educatif", ...fieldsToCompare])
    .cursor();

  for await (const dualControlFormation of dualCursor) {
    const formation = await Formation.findOne({ cle_ministere_educatif: dualControlFormation.cle_ministere_educatif })
      .select(fieldsToCompare)
      .lean();

    if (!formation) {
      results.totalNotFound++;
    } else {
      fieldsToCompare.forEach((key) => {
        if (dualControlFormation[key] !== formation[key]) {
          results.fields[key]++;
        }
      });
    }
  }

  await DualControlReport.create(results);

  return results;
};

module.exports = { compare };
