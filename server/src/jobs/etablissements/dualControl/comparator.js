// @ts-check
const { DualControlEtablissement, DualControlReport } = require("../../../common/model/index");
const { Etablissement } = require("../../../common/model/index");

/** @typedef {import("../../../common/model/schema/Etablissement").Etablissement} Etablissement */

const get = (data, key) => {
  if (key.split(/\.(.+)/).length > 1) {
    return get(data[key.split(/\.(.+)/)[0]], key.split(/\.(.+)/)[1]);
  } else {
    return data ? data[key] : undefined;
  }
};

/**
 * Check equality between between one property of two objects
 *
 * @param {Etablissement} dualControlEtablissement
 * @param {Etablissement} Etablissement
 * @param  {keyof Etablissement} key
 *
 * @returns {boolean}
 */
const isEqual = (dualControlEtablissement, Etablissement, key) => {
  let result = false;
  switch (key) {
    default:
      result = get(dualControlEtablissement, key) === get(Etablissement, key);
      break;
  }

  return result;
};

/**
 * Compare all dualcontrol Etablissements with Etablissements, given the argument list of properties
 *
 * @param {number} date in ms
 * @param {Array<keyof Etablissement>} fieldsToCompare
 *
 * @returns {Promise<{date: number; totalEtablissement: number; totalDualControlEtablissement: number; totalNotFound: number; fields?: { [k: keyof Etablissement]: number; };}>}
 */
const compare = async (date = Date.now(), fieldsToCompare = [], discriminator = "etablissements") => {
  const results = {
    discriminator,
    date,
    totalFormation: await Etablissement.countDocuments(),
    totalFormationWithUnpublished: await Etablissement.countDocuments(),
    totalDualControlFormation: await DualControlEtablissement.countDocuments({ published: true }),
    totalDualControlFormationWithUnpublished: await DualControlEtablissement.countDocuments(),
    totalNotFound: 0,
  };

  results.fields = fieldsToCompare.reduce((acc, key) => {
    acc[key.replace(".", "#")] = 0;
    return acc;
  }, {});

  /**
   * @type {import("mongoose").QueryCursor<Etablissement>}
   */
  const dualCursor = DualControlEtablissement.find({})
    .select(["siret", ...fieldsToCompare])
    .lean()
    .cursor();

  for await (const dualControlEtablissement of dualCursor) {
    /**
     * @type {Etablissement}
     */
    const etablissement = await Etablissement.findOne({
      siret: dualControlEtablissement.siret,
    })
      .select(fieldsToCompare)
      .lean();

    if (!Etablissement) {
      results.totalNotFound++;
    } else {
      fieldsToCompare.forEach((key) => {
        if (!isEqual(dualControlEtablissement, etablissement, key)) {
          console.warn("wrong", key, get(dualControlEtablissement, key), "vs", get(etablissement, key));
          results.fields[key.replace(".", "#")]++;
        } else {
          // console.warn("ok", key, get(dualControlEtablissement, key), "vs", get(Etablissement, key));
        }
      });
    }
  }

  console.log(results);

  return await DualControlReport.create(results);
};

module.exports = { compare };
