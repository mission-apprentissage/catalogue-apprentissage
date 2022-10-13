const { Formation } = require("../../common/model");

/**
 * For a given RcoFormation, try to find some Formation published in catalogue which includes ids_action
 */
const findPreviousFormations = async ({ id_formation, id_certifinfo, id_action, cle_ministere_educatif }) => {
  if (!cle_ministere_educatif?.endsWith("#L01")) {
    // here merge multi-site / mono-site : check cle_ministere_educatif
    const originalSiteKey = `${cle_ministere_educatif?.split("#")[0]}#L01`;

    const previousFormation = await Formation.findOne({
      cle_ministere_educatif: originalSiteKey,
      published: true,
    }).lean();

    if (previousFormation) {
      return [previousFormation];
    }
  }

  const ids_action = extractFlatIdsAction(id_action);
  const ids_formation = id_formation.split("##");

  return await Formation.find({
    $or: [
      { cle_ministere_educatif: null }, // no key means it is a legacy formation
      { annee: "X" }, // X means it is not validated yet
    ],
    published: true,
    id_formation: { $in: ids_formation },
    "ids_action.0": { $exists: true },
    ids_action: { $not: { $elemMatch: { $nin: ids_action } } },
    id_certifinfo,
  }).lean();
};

const copyComputedFields = (oldFormation, newFormation) => {
  newFormation.distance = oldFormation.distance;
  newFormation.lieu_formation_geo_coordonnees_computed = oldFormation.lieu_formation_geo_coordonnees_computed;
  newFormation.lieu_formation_adresse_computed = oldFormation.lieu_formation_adresse_computed;
  return newFormation;
};

const copyEditedFields = (oldFormation, newFormation) => {
  newFormation.editedFields = oldFormation.editedFields;
  return newFormation;
};

const extractIdsAction = (id_action) => {
  const ids_action_arr = id_action.split("##");
  return ids_action_arr.map((actions) => actions.split("|"));
};

const extractFlatIdsAction = (id_action) => {
  return extractIdsAction(id_action).flat();
};

/**
 * For a given cle_ministere_educatif formation, try to find some Formation in catalogue (with updated cle_ministere_educatif)
 *
 * @param {{cle_ministere_educatif: string}} formation
 * @param {Object} [select={}]
 */
const findNewFormations = async ({ cle_ministere_educatif }, select = {}) => {
  const wasCollectedYear = cle_ministere_educatif.substring(10, 11) !== "X";
  if (wasCollectedYear) {
    return [];
  }

  // try to find with a collected year in catalog
  // Year values seems to be between 1 and 5, but create keys from 1 to 9 year to be sure
  const potentialKeys = Array(9)
    .fill(cle_ministere_educatif)
    .map((_value, index) => {
      const year = index + 1;
      return `${cle_ministere_educatif.slice(0, 10)}${year}${cle_ministere_educatif.slice(11)}`;
    });

  return await Formation.find({
    cle_ministere_educatif: { $in: potentialKeys },
    published: true,
  })
    .select(select)
    .lean();
};

/**
 * For a given formation corresponding to the first site (L01), try to find some Formation in catalogue with different sites
 *
 * @param {{cle_ministere_educatif: string}} formation
 * @param {Object} [select={}]
 */
const findMultisiteFormationsFromL01 = async ({ cle_ministere_educatif }, select = {}) => {
  if (!cle_ministere_educatif?.endsWith("#L01")) {
    return [];
  }

  const rootKey = cle_ministere_educatif?.split("#")[0];
  const multisiteFormations = await Formation.find({
    cle_ministere_educatif: { $ne: cle_ministere_educatif, $regex: new RegExp(`^${rootKey}#`) },
    published: true,
  })
    .select(select)
    .lean();

  return multisiteFormations;
};

module.exports = {
  findPreviousFormations,
  extractFlatIdsAction,
  copyComputedFields,
  copyEditedFields,
  findNewFormations,
  findMultisiteFormationsFromL01,
};
