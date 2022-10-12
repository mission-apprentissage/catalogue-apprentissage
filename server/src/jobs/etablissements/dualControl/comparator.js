// @ts-check
const { DualControlEtablissement, DualControlReport } = require("../../../common/model/index");
const { Etablissement } = require("../../../common/model/index");
const { diff: arrayDiff } = require("../../../common/utils/arrayUtils");
const { diff: objectDiff } = require("deep-object-diff");

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
 * @param {Etablissement} etablissement
 * @param  {keyof Etablissement} key
 *
 * @returns {boolean}
 */
const isEqual = (dualControlEtablissement, etablissement, key) => {
  let result = false;

  if (typeof get(dualControlEtablissement, key) !== typeof get(etablissement, key)) {
    return false;
  }

  switch (true) {
    case get(dualControlEtablissement, key) === null:
      result = get(etablissement, key) === null;
      break;
    case Array.isArray(get(dualControlEtablissement, key)):
      result = !arrayDiff(get(dualControlEtablissement, key), get(etablissement, key)).length;
      break;
    case typeof get(dualControlEtablissement, key) === "object":
      result = !Object.keys(objectDiff(get(dualControlEtablissement, key), get(etablissement, key)) ?? {}).length;
      break;
    default:
      result = get(dualControlEtablissement, key) === get(etablissement, key);

      break;
  }

  // console.log({
  //   dcValue: get(dualControlEtablissement, key),
  //   value: get(etablissement, key),
  //   result,
  // });

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
