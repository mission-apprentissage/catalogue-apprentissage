// @ts-check
const { diff: objectDiff } = require("deep-object-diff");
const { diff: arrayDiff } = require("../../../common/utils/arrayUtils");
const { DualControlFormation, DualControlReport } = require("../../../common/model/index");
const { Formation } = require("../../../common/model/index");
const { DateTime } = require("luxon");

/** @typedef {import("../../../common/model/schema/formation").Formation} Formation */

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
 * @param {Formation} dualControlFormation
 * @param {Formation} formation
 * @param  {string} key //  {keyof Formation} key
 *
 * @returns {boolean}
 */
const isEqual = (dualControlFormation, formation, key) => {
  let result = false;
  switch (key) {
    case "bcn_mefs_10": {
      result =
        [
          ...(dualControlFormation.bcn_mefs_10?.filter(
            (dcfMef10) =>
              !formation.bcn_mefs_10?.filter(
                (fMef10) =>
                  fMef10.mef10 === dcfMef10.mef10 &&
                  fMef10.modalite?.duree === dcfMef10.modalite?.duree &&
                  fMef10.modalite?.annee === dcfMef10.modalite?.annee
              ).length
          ) ?? []),
          ...(formation.bcn_mefs_10?.filter(
            (fMef10) =>
              !dualControlFormation.bcn_mefs_10?.filter(
                (dcfMef10) =>
                  fMef10.mef10 === dcfMef10.mef10 &&
                  fMef10.modalite?.duree === dcfMef10.modalite?.duree &&
                  fMef10.modalite?.annee === dcfMef10.modalite?.annee
              ).length
          ) ?? []),
        ].length === 0;

      break;
    }
    case "rncp_details":
    case "periode": {
      const difference = objectDiff(dualControlFormation[key], formation[key]) ?? {};
      const keys = Object.keys(difference);
      result = keys.length === 0;
      break;
    }

    case "lieu_formation_adresse":
    case "lieu_formation_adresse_computed":
    case "etablissement_formateur_adresse": {
      result = `${dualControlFormation[key]}`.toLowerCase() === `${formation[key]}`.toLowerCase();
      break;
    }

    case "ids_action":
    case "tags":
    case "rome_codes": {
      result = arrayDiff(dualControlFormation[key], formation[key]).length === 0;
      break;
    }

    case "cfd_date_fermeture":
    case "etablissement_gestionnaire_date_creation":
    case "etablissement_formateur_date_creation":
    case "rncp_details.date_fin_validite_enregistrement":
      // console.log(
      //   get(dualControlFormation, key),
      //   get(formation, key),
      //   DateTime.fromJSDate(get(dualControlFormation, key)).toISO() === DateTime.fromJSDate(get(formation, key)).toISO()
      // );
      result =
        DateTime.fromJSDate(get(dualControlFormation, key)).toISO() ===
        DateTime.fromJSDate(get(formation, key)).toISO();
      break;

    default:
      result = get(dualControlFormation, key) === get(formation, key);
      break;
  }

  return result;
};

/**
 * Compare all dualcontrol formations with formations, given the argument list of properties
 *
 * @param {number} date in ms
 * @param  {Array<string>} fieldsToCompare // {Array<keyof Formation>} fieldsToCompare
 *
 * @returns {Promise<{date: number; totalFormation: number; totalDualControlFormation: number; totalNotFound: number; fields?: { [k: keyof Formation]: number; };}>}
 */
const compare = async (date = Date.now(), fieldsToCompare = [], discriminator = null) => {
  const results = {
    discriminator,
    date,
    totalFormation: await Formation.countDocuments({ published: true }),
    totalFormationWithUnpublished: await Formation.countDocuments(),
    totalDualControlFormation: await DualControlFormation.countDocuments({ published: true }),
    totalDualControlFormationWithUnpublished: await DualControlFormation.countDocuments(),
    totalNotFound: 0,
  };

  results.fields = fieldsToCompare.reduce((acc, key) => {
    acc[key.replace(".", "#")] = 0;
    return acc;
  }, {});

  /**
   * @type {import("mongoose").QueryCursor<Formation>}
   */
  const dualCursor = DualControlFormation.find({})
    .select(["cle_ministere_educatif", ...fieldsToCompare])
    .lean()
    .cursor();

  for await (const dualControlFormation of dualCursor) {
    /**
     * @type {Formation}
     */
    const formation = await Formation.findOne({ cle_ministere_educatif: dualControlFormation.cle_ministere_educatif })
      .select(fieldsToCompare)
      .lean();

    if (!formation) {
      results.totalNotFound++;
    } else {
      fieldsToCompare.forEach((key) => {
        // if (key === "rncp_details.code_type_certif") {
        // if (
        //   [
        //     "rncp_details.date_fin_validite_enregistrement",
        //     "rncp_details.active_inactive",
        //     "rncp_details.etat_fiche_rncp",
        //     "rncp_details.niveau_europe",
        //     "rncp_details.code_type_certif",
        //     "rncp_details.type_certif",
        //     "rncp_details.ancienne_fiche",
        //     "rncp_details.nouvelle_fiche",
        //     "rncp_details.demande",
        //     "rncp_details.certificateurs",
        //     "rncp_details.nsf_code",
        //     "rncp_details.nsf_libelle",
        //     "rncp_details.partenaires",
        //     "rncp_details.romes",
        //     "rncp_details.blocs_competences",
        //     "rncp_details.voix_acces",
        //     "rncp_details.rncp_outdated",
        //   ].includes(key)
        // ) {
        if (!isEqual(dualControlFormation, formation, key)) {
          // console.warn("wrong", key, get(dualControlFormation, key), "vs", get(formation, key));
          results.fields[key.replace(".", "#")]++;
        } else {
          // console.warn("ok", key, get(dualControlFormation, key), "vs", get(formation, key));
        }
        // }
      });
    }
  }

  await DualControlReport.create(results);

  return results;
};

module.exports = { compare };