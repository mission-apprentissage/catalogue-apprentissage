const { Formation, DualControlFormation, Etablissement } = require("../../../common/model/index");
const { cursor } = require("../../../common/utils/cursor");
const { diff } = require("deep-object-diff");
const { isValideUAI, getCoordinatesFromAddressData } = require("@mission-apprentissage/tco-service-node");
const { distanceBetweenCoordinates } = require("../../../common/utils/distanceUtils");
const logger = require("../../../common/logger");
const { computeMefs } = require("../../../logic/finder/mefsFinder");

const updateRelationFields = async () => {
  logger.info(" == Updating relations for formations == ");

  await cursor(Formation.find({}).sort(), async (formation) => {
    await Formation.updateOne({ _id: formation._id }, { $set: { ...(await computeRelationFields(formation)) } });
  });

  logger.info(" == Updating relations for formations: DONE == ");
};

const computeRelationFields = async (fields) => {
  const etablissementGestionnaire = await Etablissement.find({ siret: fields.etablissement_gestionnaire_siret });
  const etablissementFormateur = await Etablissement.find({ siret: fields.etablissement_formateur_siret });

  const etablissement_gestionnaire_id = etablissementGestionnaire?.id;
  const etablissement_formateur_id = etablissementFormateur?.id;
  const etablissement_gestionnaire_published = etablissementGestionnaire?.published;
  const etablissement_formateur_published = etablissementFormateur?.published;

  return {
    etablissement_gestionnaire_id,
    etablissement_formateur_id,
    etablissement_gestionnaire_published,
    etablissement_formateur_published,

    ...fields,
  };
};

const recomputeFields = async (fields, oldFields) => {
  let { duree_incoherente, annee_incoherente } = await computeMefs(fields);

  let distance_lieu_formation_etablissement_formateur = oldFields?.distance_lieu_formation_etablissement_formateur;

  if (
    fields.geo_coordonnees_etablissement_formateur !== oldFields?.geo_coordonnees_etablissement_formateur ||
    fields.lieu_formation_geo_coordonnees !== oldFields?.lieu_formation_geo_coordonnee
  ) {
    if (!!fields.geo_coordonnees_etablissement_formateur && !!fields.lieu_formation_geo_coordonnees) {
      distance_lieu_formation_etablissement_formateur =
        fields.geo_coordonnees_etablissement_formateur &&
        fields.lieu_formation_geo_coordonnees &&
        distanceBetweenCoordinates(
          Number(fields.geo_coordonnees_etablissement_formateur?.split("##")[0]?.split(",")[0]),
          Number(fields.geo_coordonnees_etablissement_formateur?.split("##")[0]?.split(",")[1]),
          Number(fields.lieu_formation_geo_coordonnees?.split("##")[0]?.split(",")[0]),
          Number(fields.lieu_formation_geo_coordonnees?.split("##")[0]?.split(",")[1])
        );
    } else {
      distance_lieu_formation_etablissement_formateur = undefined;
    }
  }

  let lieu_formation_geo_coordonnees_computed = oldFields?.lieu_formation_geo_coordonnees_computed;
  let lieu_formation_adresse_computed = oldFields?.lieu_formation_adresse_computed;
  let distance = oldFields?.distance;

  if (fields.lieu_formation_geo_coordonnees !== oldFields?.lieu_formation_geo_coordonnees) {
    const addressData = {
      nom_voie: fields.lieu_formation_adresse,
      localite: fields.localite,
      code_postal: fields.code_postal,
      code_insee: fields.code_commune_insee,
    };

    try {
      const { result } = await getCoordinatesFromAddressData(addressData);
      lieu_formation_geo_coordonnees_computed = result.geo_coordonnees;

      if (!!lieu_formation_geo_coordonnees_computed && !!fields.lieu_formation_geo_coordonnees) {
        const [lat1, lon1] = lieu_formation_geo_coordonnees_computed?.split("##")[0]?.split(",") ?? [];
        const [lat2, lon2] = fields.lieu_formation_geo_coordonnees?.split("##")[0]?.split(",") ?? [];

        distance = await distanceBetweenCoordinates(lat1, lon1, lat2, lon2);
      }
    } catch (e) {
      console.error(e);
      lieu_formation_geo_coordonnees_computed = undefined;
      lieu_formation_adresse_computed = undefined;
      distance = undefined;
    }
  }

  return {
    duree_incoherente,
    annee_incoherente,
    distance_lieu_formation_etablissement_formateur,

    distance,
    lieu_formation_geo_coordonnees_computed,
    lieu_formation_adresse_computed,

    // ...(await computeRelationFields(fields)),

    ...fields,
  };
};

/**
 *
 */
const removeFields = (entity, fields) => {
  fields.forEach((field) => {
    delete entity[field];
  });

  return entity;
};

const unpublishOthers = async () => {
  const result = await Formation.updateMany(
    {
      cle_ministere_educatif: { $nin: await DualControlFormation.distinct("cle_ministere_educatif") },
    },
    {
      $set: { published: false },
    }
  );

  return { removed: result.nModified };
};

const applyConversion = async () => {
  let added = 0,
    notUpdated = 0,
    updated = 0;

  await cursor(
    DualControlFormation.find().sort(),

    async ({ cle_ministere_educatif }) => {
      const dcFormation = await DualControlFormation.findOne({ cle_ministere_educatif }).lean();
      const formation = await Formation.findOne({ cle_ministere_educatif }).lean();

      // console.log("================================");
      // console.log({ formation, dcFormation });
      // console.log("================================");

      // Si la formation existe
      if (formation) {
        const toRestore = [];

        const toRecompute = [
          "annee_incoherente",
          "distance_lieu_formation_etablissement_formateur",
          "duree_incoherente",
          "etablissement_formateur_id",
          "etablissement_formateur_published",
          "etablissement_gestionnaire_id",
          "etablissement_gestionnaire_published",
          "distance",
          "lieu_formation_geo_coordonnees_computed",
          "lieu_formation_adresse_computed",
        ];

        const toDelete = [];

        const notToCompare = ["_id", "__v", "created_at", "last_update_at", ...toDelete, ...toRestore, ...toRecompute];

        await Formation.updateOne(
          { cle_ministere_educatif },
          { $set: { ...(await recomputeFields(removeFields({ ...dcFormation }, notToCompare), formation)) } }
        );

        const newFormation = await Formation.findById(formation._id).lean();

        Object.keys(diff(formation, newFormation)).length ? updated++ : notUpdated++;
      }

      // Si la formation n'existe pas
      else {
        console.warn(`${dcFormation.cle_ministere_educatif} not found`);
        added++;

        await Formation.create(await recomputeFields(dcFormation));
      }
    }
  );

  return { added, updated, notUpdated };
};

const converter = async () => {
  let error = null;
  try {
    const { added, updated, notUpdated } = await applyConversion();

    const { removed } = await unpublishOthers();

    console.log({ added, updated, notUpdated, removed });
  } catch (e) {
    error = e;
    console.error(e);
  }

  return error;
};

module.exports = { converter, updateRelationFields };
