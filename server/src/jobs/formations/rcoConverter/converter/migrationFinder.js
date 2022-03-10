const { Formation, ParcoursupFormation } = require("../../../../common/model");
const { asyncForEach } = require("../../../../common/utils/asyncUtils");

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

const copyAffelnetFields = (oldFormation, newFormation) => {
  newFormation.affelnet_statut = oldFormation.affelnet_statut;
  newFormation.affelnet_statut_history = oldFormation.affelnet_statut_history;
  newFormation.affelnet_infos_offre = oldFormation.affelnet_infos_offre;
  newFormation.affelnet_code_nature = oldFormation.affelnet_code_nature;
  newFormation.affelnet_secteur = oldFormation.affelnet_secteur;
  newFormation.affelnet_raison_depublication = oldFormation.affelnet_raison_depublication;
  newFormation.affelnet_published_date = oldFormation.affelnet_published_date;
  return newFormation;
};

const copyParcoursupFields = (oldFormation, newFormation) => {
  newFormation.parcoursup_statut = oldFormation.parcoursup_statut;
  newFormation.parcoursup_statut_history = oldFormation.parcoursup_statut_history;
  newFormation.parcoursup_raison_depublication = oldFormation.parcoursup_raison_depublication;
  newFormation.parcoursup_published_date = oldFormation.parcoursup_published_date;
  return newFormation;
};

const copyRapprochementFields = (oldFormation, newFormation) => {
  newFormation.parcoursup_id = oldFormation.parcoursup_id;
  return newFormation;
};

const updateRapprochement = async (oldFormation, newFormation) => {
  const psFormations = await ParcoursupFormation.find({
    "matching_mna_formation.cle_ministere_educatif": oldFormation.cle_ministere_educatif,
  }).lean();

  await asyncForEach(psFormations, async (psFormation) => {
    let matchs = psFormation.matching_mna_formation?.map((match) => {
      let _id = match._id;
      let cle_ministere_educatif = match.cle_ministere_educatif;
      if (_id?.toString() === oldFormation._id?.toString()) {
        _id = newFormation._id;
        cle_ministere_educatif = newFormation.cle_ministere_educatif;
      }
      return { ...match, _id, cle_ministere_educatif };
    });

    // keep unique match
    matchs = matchs.reduce((acc, match) => {
      if (acc.some((m) => m._id.toString() === match._id.toString())) {
        return acc;
      }
      return [...acc, match];
    }, []);

    const validatedIds = psFormation.validated_formation_ids?.map((id) => {
      if (id === oldFormation._id?.toString()) {
        return newFormation._id?.toString();
      }
      return id;
    });

    await ParcoursupFormation.findOneAndUpdate(
      { _id: psFormation._id },
      {
        matching_mna_formation: matchs,
        matching_mna_parcoursup_statuts: matchs?.map(({ parcoursup_statut }) => parcoursup_statut),
        validated_formation_ids: validatedIds,
      }
    );
  });

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
 * @param {Object} [projection={}]
 */
const findNewFormations = async ({ cle_ministere_educatif }, projection = {}) => {
  // TODO @EPT : doit-on passer à "publié" toutes les formations d'un multi-site ?
  // if (cle_ministere_educatif?.endsWith("#L01")) {
  //   const rootKey = cle_ministere_educatif?.split("#")[0];

  //   const potentialKeys = Array(8)
  //     .fill(cle_ministere_educatif)
  //     .map((_value, index) => {
  //       const siteNumber = index + 2;
  //       return `${rootKey}${"#L0"}${siteNumber}`;
  //     });

  //   const previousFormations = await Formation.find({
  //     cle_ministere_educatif: { $in: potentialKeys },
  //     published: true,
  //   })
  //     .select(projection)
  //     .lean();

  //   if (previousFormations.length > 0) {
  //     return previousFormations;
  //   }
  // }

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
    .select(projection)
    .lean();
};

module.exports = {
  findPreviousFormations,
  copyAffelnetFields,
  copyParcoursupFields,
  extractFlatIdsAction,
  copyRapprochementFields,
  updateRapprochement,
  copyComputedFields,
  copyEditedFields,
  findNewFormations,
};
