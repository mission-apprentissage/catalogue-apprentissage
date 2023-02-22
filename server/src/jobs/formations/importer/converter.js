const config = require("config");
const {
  isValideUAI,
  getCoordinatesFromAddressData,
  getAddressFromCoordinates,
} = require("@mission-apprentissage/tco-service-node");
const { diff } = require("deep-object-diff");
const { Formation, DualControlFormation, Etablissement } = require("../../../common/model/index");
const { cursor } = require("../../../common/utils/cursor");
const { distanceBetweenCoordinates } = require("../../../common/utils/distanceUtils");
const logger = require("../../../common/logger");
const { computeMefs } = require("../../../logic/finder/mefsFinder");
const { getCfdEntree } = require("../../../logic/finder/cfdEntreeFinder");

const updateRelationFields = async () => {
  logger.info({ type: "job" }, " == Updating relations for formations == ");

  await cursor(Formation.find({}).sort(), async (formation) => {
    await Formation.updateOne({ _id: formation._id }, { $set: { ...(await computeRelationFields(formation)) } });
  });

  logger.info({ type: "job" }, " == Updating relations for formations: DONE == ");
};

const computeRelationFields = async (fields) => {
  const etablissementGestionnaire = await Etablissement.findOne({ siret: fields.etablissement_gestionnaire_siret });
  const etablissementFormateur = await Etablissement.findOne({ siret: fields.etablissement_formateur_siret });

  const etablissement_gestionnaire_id = etablissementGestionnaire?.id;
  const etablissement_formateur_id = etablissementFormateur?.id;
  const etablissement_gestionnaire_published = etablissementGestionnaire?.published;
  const etablissement_formateur_published = etablissementFormateur?.published;

  return {
    etablissement_gestionnaire_id,
    etablissement_formateur_id,
    etablissement_gestionnaire_published,
    etablissement_formateur_published,
  };
};

const recomputeFields = async (fields, oldFields, { forceRecompute = false } = { forceRecompute: false }) => {
  // MEFS & PLATEFORMES

  let affelnet_mefs_10 = oldFields?.affelnet_mefs_10 ?? [],
    affelnet_infos_offre = oldFields?.affelnet_infos_offre,
    parcoursup_mefs_10 = oldFields?.parcoursup_mefs_10 ?? [],
    duree_incoherente = oldFields?.duree_incoherente,
    annee_incoherente = oldFields?.annee_incoherente;

  if (
    forceRecompute ||
    Object.entries(diff(fields?.bcn_mefs_10, oldFields?.bcn_mefs_10) ?? {}).length ||
    fields?.duree !== oldFields?.duree ||
    fields?.annee !== oldFields?.annee
  ) {
    ({
      affelnet_mefs_10,
      affelnet_infos_offre,
      parcoursup_mefs_10,
      duree_incoherente,
      annee_incoherente,
    } = await computeMefs(fields, oldFields));

    console.log("Compute mefs", {
      cle_ministere_educatif: fields?.cle_ministere_educatif,

      fields: {
        bcn_mefs_10: fields?.bcn_mefs_10,
        duree: fields?.duree,
        annee: fields?.annee,
      },
      oldFields: {
        bcn_mefs_10: oldFields?.bcn_mefs_10,
        duree: oldFields?.duree,
        annee: oldFields?.annee,
        affelnet_mefs_10: oldFields?.affelnet_mefs_10,
        affelnet_infos_offre: oldFields?.affelnet_infos_offre,
        parcoursup_mefs_10: oldFields?.parcoursup_mefs_10,
        duree_incoherente: oldFields?.duree_incoherente,
        annee_incoherente: oldFields?.annee_incoherente,
      },

      computed: {
        affelnet_mefs_10,
        affelnet_infos_offre,
        parcoursup_mefs_10,
        duree_incoherente,
        annee_incoherente,
      },
    });
  }

  // DISTANCE_LIEU_FORMATION_ETABLISSEMENT_FORMATEUR

  let distance_lieu_formation_etablissement_formateur = oldFields?.distance_lieu_formation_etablissement_formateur;

  if (
    forceRecompute ||
    fields.geo_coordonnees_etablissement_formateur !== oldFields?.geo_coordonnees_etablissement_formateur ||
    fields.lieu_formation_geo_coordonnees !== oldFields?.lieu_formation_geo_coordonnees
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

  // UAI_FORMATION

  const uai_formation =
    oldFields?.editedFields?.uai_formation ??
    fields?.uai_formation ??
    fields?.etablissement_formateur_uai ??
    oldFields?.uai_formation ??
    oldFields?.etablissement_formateur_uai;

  const uai_formation_valide = !fields.uai_formation || (await isValideUAI(uai_formation));

  let lieu_formation_geo_coordonnees_computed = oldFields?.lieu_formation_geo_coordonnees_computed;
  let lieu_formation_adresse_computed = oldFields?.lieu_formation_adresse_computed;
  let distance = oldFields?.distance;

  // ADRESSE

  if (
    fields.lieu_formation_geo_coordonnees &&
    (forceRecompute || fields.lieu_formation_geo_coordonnees !== oldFields?.lieu_formation_geo_coordonnees)
  ) {
    try {
      const [latitude, longitude] = fields.lieu_formation_geo_coordonnees.split("##")[0]?.split(",");
      const { result } = (await getAddressFromCoordinates({ latitude, longitude })) ?? {};

      lieu_formation_adresse_computed = result?.adresse
        ? `${result.adresse.numero_voie} ${result.adresse.type_voie} ${result.adresse.nom_voie} ${result.adresse.code_postal} ${result.adresse.commune}`
        : undefined;
    } catch (e) {
      console.error(e);
      lieu_formation_adresse_computed = undefined;
    }

    console.log("Compute adresse", {
      cle_ministere_educatif: fields?.cle_ministere_educatif,

      fields: {
        lieu_formation_geo_coordonnees: fields?.lieu_formation_geo_coordonnees,
        lieu_formation_adresse_computed: fields?.lieu_formation_adresse_computed,
      },
      oldFields: {
        lieu_formation_geo_coordonnees: oldFields?.lieu_formation_geo_coordonnees,
        lieu_formation_adresse_computed: oldFields?.lieu_formation_adresse_computed,
      },
      computed: {
        lieu_formation_adresse_computed,
      },
    });
  }

  // GEOCOORDONNEES
  if (
    fields.lieu_formation_adresse &&
    fields.localite &&
    fields.code_postal &&
    fields.code_commune_insee &&
    (forceRecompute ||
      fields.lieu_formation_adresse !== oldFields?.lieu_formation_adresse ||
      fields.localite !== oldFields?.localite ||
      fields.code_postal !== oldFields?.code_postal ||
      fields.code_commune_insee !== oldFields?.code_commune_insee)
  ) {
    const addressData = {
      nom_voie: fields.lieu_formation_adresse,
      localite: fields.localite,
      code_postal: fields.code_postal,
      code_insee: fields.code_commune_insee,
    };

    try {
      const { result } = (await getCoordinatesFromAddressData(addressData)) ?? {};
      lieu_formation_geo_coordonnees_computed = result?.geo_coordonnees;
    } catch (e) {
      console.error(e);
      lieu_formation_geo_coordonnees_computed = undefined;
    }

    console.log("Compute geocoordonnees", {
      cle_ministere_educatif: fields?.cle_ministere_educatif,

      fields: {
        lieu_formation_adresse: fields?.lieu_formation_adresse,
        localite: fields?.localite,
        code_postal: fields?.code_postal,
        code_commune_insee: fields?.code_commune_insee,
        lieu_formation_geo_coordonnees_computed: fields?.lieu_formation_geo_coordonnees_computed,
      },
      oldFields: {
        lieu_formation_adresse: oldFields?.lieu_formation_adresse,
        localite: oldFields?.localite,
        code_postal: oldFields?.code_postal,
        code_commune_insee: oldFields?.code_commune_insee,
        lieu_formation_geo_coordonnees_computed: oldFields?.lieu_formation_geo_coordonnees_computed,
      },
      computed: {
        lieu_formation_geo_coordonnees_computed,
      },
    });
  }

  // DISTANCE

  if (
    forceRecompute ||
    fields.lieu_formation_geo_coordonnees !== oldFields?.lieu_formation_geo_coordonnees ||
    lieu_formation_geo_coordonnees_computed !== oldFields?.lieu_formation_geo_coordonnees_computed
  ) {
    if (!!lieu_formation_geo_coordonnees_computed && !!fields.lieu_formation_geo_coordonnees) {
      const [lat1, lon1] = lieu_formation_geo_coordonnees_computed?.split("##")[0]?.split(",") ?? [];
      const [lat2, lon2] = fields.lieu_formation_geo_coordonnees?.split("##")[0]?.split(",") ?? [];

      distance = await distanceBetweenCoordinates(lat1, lon1, lat2, lon2);
    } else {
      distance = undefined;
    }

    console.log("Compute distance", {
      cle_ministere_educatif: fields?.cle_ministere_educatif,

      fields: {
        lieu_formation_geo_coordonnees: fields.lieu_formation_geo_coordonnees,
        distance: fields.distance,
        lieu_formation_geo_coordonnees_computed: lieu_formation_geo_coordonnees_computed,
      },
      oldFields: {
        lieu_formation_geo_coordonnees: oldFields?.lieu_formation_geo_coordonnees,
        distance: oldFields?.distance,
        lieu_formation_geo_coordonnees_computed: oldFields?.lieu_formation_geo_coordonnees_computed,
      },
      computed: {
        distance,
      },
    });
  }

  const cfd_entree = getCfdEntree(fields.cfd);

  return {
    affelnet_mefs_10,
    affelnet_infos_offre,
    parcoursup_mefs_10,
    duree_incoherente,
    annee_incoherente,
    distance_lieu_formation_etablissement_formateur,
    uai_formation,
    uai_formation_valide,

    distance,
    lieu_formation_geo_coordonnees_computed,
    lieu_formation_adresse_computed,

    cfd_entree,
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

const applyConversion = async ({ forceRecompute = false, skip = 0 } = { forceRecompute: false, skip: 0 }) => {
  let added = 0,
    notUpdated = 0,
    updated = 0;

  await cursor(
    DualControlFormation.find({}).sort().skip(skip),

    async ({ cle_ministere_educatif }) => {
      const dcFormation = await DualControlFormation.findOne({ cle_ministere_educatif }).lean();
      const formation = await Formation.findOne({ cle_ministere_educatif }).lean();

      // console.log("================================");
      // console.log({ cle_ministere_educatif, formation, dcFormation });
      // console.log("================================");

      // Si la formation existe
      if (formation) {
        const notToCompare = [
          "_id",
          "__v",
          "created_at",
          "updated_at",
          "last_updated_at",
          "lieu_formation_adresse_computed",
          "lieu_formation_geo_coordonnees_computed",
        ];

        const result = await Formation.updateOne(
          { cle_ministere_educatif },
          {
            $set: {
              ...(await recomputeFields(removeFields({ ...dcFormation }, notToCompare), formation, { forceRecompute })),
            },
          },
          { timestamps: false }
        );

        if (result.nModified) {
          updated++;

          if (config.log?.level === "debug") {
            const newFormation = await Formation.findById(formation._id).lean();
            const differences = diff(formation, newFormation);
            console.debug({ cle_ministere_educatif, differences });
          }

          await Formation.updateOne({ cle_ministere_educatif }, { $set: {} });
        } else {
          notUpdated++;
        }
      }

      // Si la formation n'existe pas
      else {
        // console.info(`${dcFormation.cle_ministere_educatif} not found`);
        added++;

        await Formation.create(await recomputeFields(dcFormation, null, { forceRecompute }));
      }
    }
  );

  return { added, updated, notUpdated };
};

const converter = async ({ forceRecompute = false, skip = 0 } = { forceRecompute: false, skip: 0 }) => {
  let error = null;
  try {
    const { added, updated, notUpdated } = await applyConversion({ forceRecompute, skip });

    const { removed } = await unpublishOthers();

    console.log({ added, updated, notUpdated, removed });
  } catch (e) {
    error = e;
    logger.error(
      {
        type: "job",
      },
      error
    );
  }

  return error;
};

module.exports = { converter, updateRelationFields };
