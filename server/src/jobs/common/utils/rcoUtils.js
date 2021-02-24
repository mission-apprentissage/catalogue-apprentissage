const { RcoFormation } = require("../../../common/model/index");

/**
 * helper to get a rco formation from a converted id
 * since we use "|" as separator and RCO can do that too :cry:
 */
const findRcoFormationFromConvertedId = async (id_rco_formation) => {
  const found = await RcoFormation.aggregate([
    { $project: { newField: { $concat: ["$id_formation", "|", "$id_action", "|", "$id_certifinfo"] } } },
    { $match: { newField: id_rco_formation } },
  ]);

  if (found.length > 0) {
    return await RcoFormation.findOne({ _id: found[0]._id });
  }

  return null;
};

/**
 * extract array of years from array of string dates
 */
const getPeriodeTags = (periode = []) => {
  return periode.reduce((acc, dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    if (!year || acc.includes(`${year}` || year < 2020)) {
      return acc;
    }
    return [...acc, `${year}`];
  }, []);
};

module.exports = { findRcoFormationFromConvertedId, getPeriodeTags };
