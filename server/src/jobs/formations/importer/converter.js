const { Formation, DualControlFormation, Etablissement } = require("../../../common/model/index");
const { cursor } = require("../../../common/utils/cursor");
const { diff } = require("deep-object-diff");
const { isValideUAI } = require("@mission-apprentissage/tco-service-node");
const { distanceBetweenCoordinates } = require("../../../common/utils/distanceUtils");

const recomputeFields = async (fields) => {
  const etablissementGestionnaire = await Etablissement.find({ siret: fields.etablissement_gestionnaire_siret });
  const etablissementFormateur = await Etablissement.find({ siret: fields.etablissement_formateur_siret });

  const etablissement_gestionnaire_id = etablissementGestionnaire.id;
  const etablissement_formateur_id = etablissementFormateur.id;
  const etablissement_gestionnaire_published = etablissementGestionnaire.published;
  const etablissement_formateur_published = etablissementFormateur.published;

  // let affelnet_mefs_10
  // let parcoursup_mefs_10

  let annee_incoherente;
  let duree_incoherente;

  if (fields.duree && fields.duree !== "X") {
    fields.bcn_mefs_10 = fields.bcn_mefs_10?.filter(({ modalite }) => {
      return modalite.duree === fields.duree;
    });

    duree_incoherente =
      !!fields.bcn_mefs_10.length &&
      fields.bcn_mefs_10.every(({ modalite }) => {
        return modalite.duree !== fields.duree;
      });
  }

  if (fields.annee && fields.annee !== "X") {
    fields.bcn_mefs_10 = fields.bcn_mefs_10?.filter(({ modalite }) => {
      return modalite.annee === fields.annee;
    });

    annee_incoherente =
      !!fields.bcn_mefs_10.length &&
      fields.bcn_mefs_10.every(({ modalite }) => {
        return modalite.annee !== fields.annee;
      });
  }

  const distance_lieu_formation_etablissement_formateur =
    fields.geo_coordonnees_etablissement_formateur &&
    fields.lieu_formation_geo_coordonnees &&
    distanceBetweenCoordinates(
      Number(fields.geo_coordonnees_etablissement_formateur.split(",")[0]),
      Number(fields.geo_coordonnees_etablissement_formateur.split(",")[1]),
      Number(fields.lieu_formation_geo_coordonnees.split(",")[0]),
      Number(fields.lieu_formation_geo_coordonnees.split(",")[1])
    );

  // const idea_geo_coordonnees_etablissement =

  const uai_formation_valide = !fields.uai_formation || (await isValideUAI(fields.uai_formation));

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
          "affelnet_raison_depublication",
          "affelnet_secteur",
          "affelnet_statut_history",
          "affelnet_statut",
          "forced_published",
          "last_status",
          "last_statut_update_date",
          "last_update_who",
          "parcoursup_statut",
          "parcoursup_statut_history",
          "parcoursup_raison_depublication",
          "parcoursup_published_date",
          "parcoursup_id",
          "rejection",
          "updates_history",
          "editedFields",
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
          "distance",
          "lieu_formation_geo_coordonnees_computed",
          "lieu_formation_adresse_computed",
        ];

        // TODO : to Remove before first conversion
        const toDelete = ["rco_published"];

        const notToCompare = ["_id", "__v", "created_at", "last_update_at", ...toDelete, ...toRestore, ...toRecompute];

        await Formation.updateOne(
          { cle_ministere_educatif },
          { $set: { ...(await recomputeFields(removeFields({ ...dcFormation }, notToCompare))) } }
        );

        const newFormation = await Formation.findById(formation._id).lean();

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
