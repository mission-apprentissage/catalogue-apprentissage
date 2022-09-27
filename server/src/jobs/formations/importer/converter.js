const { Formation, DualControlFormation, Etablissement } = require("../../../common/model/index");
const { cursor } = require("../../../common/utils/cursor");
const { diff } = require("deep-object-diff");
const { isValideUAI } = require("@mission-apprentissage/tco-service-node");
const { distanceBetweenCoordinates } = require("../../../common/utils/distanceUtils");

const recomputeFields = async ({
  etablissement_gestionnaire_siret,
  etablissement_formateur_siret,
  uai_formation,
  geo_coordonnees_etablissement_formateur,
  lieu_formation_geo_coordonnees,
  duree,
  annee,
  bcn_mefs_10,
  ...fields
}) => {
  const etablissementGestionnaire = await Etablissement.find({ siret: etablissement_gestionnaire_siret });
  const etablissementFormateur = await Etablissement.find({ siret: etablissement_formateur_siret });

  const etablissement_gestionnaire_id = etablissementGestionnaire.id;
  const etablissement_formateur_id = etablissementFormateur.id;
  const etablissement_gestionnaire_published = etablissementGestionnaire.published;
  const etablissement_formateur_published = etablissementFormateur.published;

  // let affelnet_mefs_10
  // let parcoursup_mefs_10

  let annee_incoherente;
  let duree_incoherente;

  if (duree && duree !== "X") {
    bcn_mefs_10 = bcn_mefs_10?.filter(({ modalite }) => {
      return modalite.duree === duree;
    });

    duree_incoherente =
      !!bcn_mefs_10.length &&
      bcn_mefs_10.every(({ modalite }) => {
        return modalite.duree !== duree;
      });
  }

  if (annee && annee !== "X") {
    bcn_mefs_10 = bcn_mefs_10?.filter(({ modalite }) => {
      return modalite.annee === annee;
    });

    annee_incoherente =
      !!bcn_mefs_10.length &&
      bcn_mefs_10.every(({ modalite }) => {
        return modalite.annee !== annee;
      });
  }

  const distance_lieu_formation_etablissement_formateur =
    geo_coordonnees_etablissement_formateur &&
    lieu_formation_geo_coordonnees &&
    distanceBetweenCoordinates(
      Number(geo_coordonnees_etablissement_formateur.split(",")[0]),
      Number(geo_coordonnees_etablissement_formateur.split(",")[1]),
      Number(lieu_formation_geo_coordonnees.split(",")[0]),
      Number(lieu_formation_geo_coordonnees.split(",")[1])
    );

  // const idea_geo_coordonnees_etablissement =

  const uai_formation_valide = !uai_formation || (await isValideUAI(uai_formation));

  return {
    etablissement_gestionnaire_id,
    etablissement_formateur_id,
    etablissement_gestionnaire_published,
    etablissement_formateur_published,
    // affelnet_mefs_10,
    // parcoursup_mefs_10,
    annee_incoherente,
    duree_incoherente,
    distance_lieu_formation_etablissement_formateur,
    // idea_geo_coordonnees_etablissement,
    uai_formation_valide,
    etablissement_gestionnaire_siret,
    etablissement_formateur_siret,
    uai_formation,
    geo_coordonnees_etablissement_formateur,
    lieu_formation_geo_coordonnees,
    duree,
    annee,
    bcn_mefs_10,
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
      cle_ministere_educatif: { $in: await DualControlFormation.distinct("cle_ministere_educatif") },
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
        const toRestore = [
          "affelnet_code_nature",
          "affelnet_infos_offre",
          "affelnet_perimetre",
          "affelnet_published_date",
          "affelnet_secteur",
          "affelnet_statut_history",
          "affelnet_statut",
          "forced_published",
          "last_status",
          "last_statut_update_date",
          "last_update_who",
          "parcoursup_perimetre",
          "parcoursup_statut_history",
          "parcoursup_statut",
          "rejection",
          "updates_history",
        ];

        const toRecompute = [
          "affelnet_mefs_10",
          "annee_incoherente",
          "distance_lieu_formation_etablissement_formateur",
          "duree_incoherente",
          "etablissement_formateur_id",
          "etablissement_formateur_published",
          "etablissement_gestionnaire_id",
          "etablissement_gestionnaire_published",
          "idea_geo_coordonnees_etablissement",
          "parcoursup_mefs_10",
          "uai_formation_valide",
        ];

        // TODO : to Remove before first conversion
        const toDelete = ["rco_published"];

        const notToCompare = ["_id", "__v", "created_at", "last_update_at", ...toDelete, ...toRestore, ...toRecompute];

        // const difference = diff(
        //   removeFields({ ...formation }, notToCompare),
        //   removeFields({ ...dcFormation }, notToCompare)
        // );

        // console.log({ difference });

        await Formation.updateOne(
          { cle_ministere_educatif },
          { $set: { ...(await recomputeFields(removeFields({ ...dcFormation }, notToCompare))) } }
        );

        const newFormation = await Formation.findById(formation._id).lean();

        // console.log(newFormation);
        // console.log(diff(formation, newFormation));

        Object.keys(diff(formation, newFormation)).length ? updated++ : notUpdated++;
      }

      // Si la formation n'existe pas
      else {
        console.warn(`${dcFormation.cle_ministere_educatif} not found`);
        added++;

        await Formation.create(...(await recomputeFields(dcFormation)));
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

module.exports = { converter };
