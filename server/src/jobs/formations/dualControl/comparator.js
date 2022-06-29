// @ts-check
const { diff: objectDiff } = require("deep-object-diff");
const { diff: arrayDiff } = require("../../../common/utils/arrayUtils");
const { DualControlFormation, DualControlReport } = require("../../../common/model/index");
const { Formation, RcoFormation } = require("../../../common/model/index");

/** @typedef {import("../../../common/model/schema/formation").Formation} Formation */

/**
 *  @type {Array<keyof Formation>}}
 */
const FIELDS_TO_COMPARE = [
  // Here list all the fields we want to compare
  "annee",
  "bcn_mefs_10",
  "capacite",
  "catalogue_published",
  "cfd_date_fermeture",
  "cfd_outdated",
  "cfd_specialite",
  "cfd",
  "code_commune_insee",
  "code_postal",
  "diplome",
  "distance",
  "duree",
  "etablissement_formateur_adresse",
  "etablissement_formateur_code_commune_insee",
  "etablissement_formateur_code_postal",
  "etablissement_formateur_nom_academie",
  "etablissement_formateur_nom_departement",
  "etablissement_formateur_num_academie",
  "etablissement_formateur_num_departement",
  "etablissement_formateur_region",
  "etablissement_formateur_siren",
  "etablissement_formateur_siret",
  "etablissement_formateur_uai",
  "etablissement_gestionnaire_code_commune_insee",
  "etablissement_gestionnaire_code_postal",
  "etablissement_gestionnaire_nom_academie",
  "etablissement_gestionnaire_nom_departement",
  "etablissement_gestionnaire_num_academie",
  "etablissement_gestionnaire_num_departement",
  "etablissement_gestionnaire_region",
  "etablissement_gestionnaire_siren",
  "etablissement_gestionnaire_siret",
  "etablissement_gestionnaire_uai",
  "geo_coordonnees_etablissement_formateur",
  "id_action",
  "id_certifinfo",
  "id_formation",
  "id_rco_formation",
  "intitule_court",
  "intitule_long",
  "intitule_rco",
  "lieu_formation_adresse_computed",
  "lieu_formation_adresse",
  "lieu_formation_geo_coordonnees_computed",
  "lieu_formation_geo_coordonnees",
  "lieu_formation_siret",
  "niveau",
  "onisep_discipline",
  "onisep_domaine_sousdomaine",
  "onisep_intitule",
  "onisep_libelle_poursuite",
  "onisep_lien_site_onisepfr",
  "onisep_url",
  "periode",
  "rncp_code",
  "rncp_details",
  "rncp_eligible_apprentissage",
  "rncp_intitule",
  "rome_codes",

  // New fields
  "published",
  "etablissement_formateur_cedex",
  "etablissement_formateur_certifie_qualite",
  "etablissement_formateur_complement_adresse",
  "etablissement_formateur_date_creation",
  "etablissement_formateur_enseigne",
  "etablissement_formateur_entreprise_raison_sociale",
  "etablissement_formateur_habilite_rncp",
  "etablissement_formateur_localite",
  "etablissement_gestionnaire_certifie_qualite",
  "etablissement_gestionnaire_date_creation",
  "etablissement_gestionnaire_enseigne",
  "etablissement_gestionnaire_entreprise_raison_sociale",
  "etablissement_gestionnaire_habilite_rncp",
  "etablissement_gestionnaire_localite",
  "etablissement_gestionnaire_siren",
  "etablissement_reference_certifie_qualite",
  "etablissement_reference_habilite_rncp",
  "etablissement_reference_published",
  "etablissement_reference",
  "geo_coordonnees_etablissement_gestionnaire",
  "ids_action",
  "libelle_court",
  "localite",
  "niveau_entree_obligatoire",
  "niveau_formation_diplome",
  "nom_academie",
  "nom_departement",
  "nom",
  "num_academie",
  "num_departement",
  "region",
  "tags",
];

/**
 * Check equality between between one property of two objects
 *
 * @param {Formation} dualControlFormation
 * @param {Formation} formation
 * @param {keyof Formation} key
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

    case "rome_codes": {
      result = arrayDiff(dualControlFormation[key], formation[key]).length === 0;
      break;
    }

    default:
      result = dualControlFormation[key] === formation[key];
      break;
  }

  return result;
};

/**
 * Compare all dualcontrol formations with formations, given the argument list of properties
 *
 * @param {number} date in ms
 * @param {Array<keyof Formation>} fieldsToCompare
 *
 * @returns {Promise<{date: number; totalFormation: number; totalDualControlFormation: number; totalNotFound: number; fields?: { [k: keyof Formation]: number; };}>}
 */
const compare = async (date = Date.now(), fieldsToCompare = FIELDS_TO_COMPARE) => {
  const results = {
    date,
    totalFormation: await Formation.countDocuments({ published: true }),
    totalFormationWithUnpublished: await Formation.countDocuments(),
    totalRcoFormation: await RcoFormation.countDocuments(),
    totalDualControlFormation: await DualControlFormation.countDocuments({ published: true }),
    totalDualControlFormationWithUnpublished: await DualControlFormation.countDocuments(),
    totalNotFound: 0,
  };

  results.fields = fieldsToCompare.reduce((acc, key) => {
    acc[key] = 0;
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
        if (!isEqual(dualControlFormation, formation, key)) {
          // console.warn("wrong", key, dualControlFormation[key], "vs", formation[key]);
          results.fields[key]++;
        }
      });
    }
  }

  await DualControlReport.create(results);

  return results;
};

module.exports = { compare };
