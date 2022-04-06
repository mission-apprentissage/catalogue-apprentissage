const { diff } = require("deep-object-diff");
const { DualControlFormation, DualControlReport } = require("../../../common/model/index");
const { Formation } = require("../../../common/model/index");

// Here list all the fields we want to compare
const FIELDS_TO_COMPARE = [
  "id_rco_formation",
  "id_formation",
  "id_action",
  "id_certifinfo",
  "periode",
  "duree",
  "capacite",
  "annee",
  "etablissement_gestionnaire_siret",
  "etablissement_gestionnaire_uai",
  "etablissement_formateur_siret",
  "etablissement_formateur_uai",
  "etablissement_formateur_siren",
  "intitule_rco",
  "cfd",
  "cfd_outdated",
  "rncp_code",
  // "bcn_mefs_10",
  "cfd_date_fermeture",
  "cfd_specialite",
  "niveau",
  "intitule_court",
  "intitule_long",
  "diplome",
  "lieu_formation_adresse",
  "code_postal",
  "lieu_formation_geo_coordonnees",
  "code_commune_insee",
  "lieu_formation_siret",
  "lieu_formation_adresse_computed",
  "lieu_formation_geo_coordonnees_computed",
  "distance",
  "onisep_url",
  "onisep_intitule",
  "onisep_libelle_poursuite",
  "onisep_lien_site_onisepfr",
  "onisep_discipline",
  "onisep_domaine_sousdomaine",
];

const isEqual = (dualControlFormation, formation, key) => {
  let result = false;
  switch (key) {
    case "periode": {
      const difference = diff(dualControlFormation[key], formation[key]);
      const keys = Object.keys(difference);
      result = keys.length === 0;
      break;
    }

    default:
      result = dualControlFormation[key] === formation[key];
      break;
  }

  return result;
};

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
