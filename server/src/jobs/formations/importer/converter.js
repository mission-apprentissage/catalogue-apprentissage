const { Formation, DualControlFormation } = require("../../../common/model/index");
const { cursor } = require("../../../common/utils/cursor");

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
  // console.log(`before: ${await Formation.countDocuments({ rco_published: true })}`);

  const result = await Formation.updateMany(
    {
      cle_ministere_educatif: { $in: await DualControlFormation.distinct("cle_ministere_educatif") },
    },
    {
      $set: { rco_published: false },
    }
  );

  // console.log(`after: ${await Formation.countDocuments({ rco_published: true })}`);

  return { removed: result.nModified };
};

const applyConversion = async () => {
  let added = 0,
    notUpdated = 0,
    updated = 0;

  await cursor(
    DualControlFormation.find().sort(),

    async ({ cle_ministere_educatif }) => {
      // console.log(dcFormation.cle_ministere_educatif);
      // await setTimeout(() => {}, 1000);
      const dcFormation = await DualControlFormation.findOne({ cle_ministere_educatif }).lean();
      const formation = await Formation.findOne({ cle_ministere_educatif }).lean();

      // console.log("================================");
      // console.log({ formation, dcFormation });
      // console.log("================================");

      let toSave;

      // Si la formation existe
      if (formation) {
        const toRestore = [
          "affelnet_perimetre",
          "affelnet_statut_history",
          "affelnet_statut",
          "affelnet_published_date",
          "affelnet_infos_offre",
          "affelnet_code_nature",
          "affelnet_secteur",
          "etablissement_formateur_id",
          "etablissement_gestionnaire_id",
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
          "etablissement_formateur_published",
          "etablissement_gestionnaire_published",
          "parcoursup_mefs_10",
          "uai_formation_valide",
          "idea_geo_coordonnees_etablissement",
        ];

        // TODO : to Remove before first conversion
        const toDelete = ["rco_published"];

        const notToCompare = ["_id", "__v", "created_at", "last_update_at", ...toDelete, ...toRestore, ...toRecompute];

        const result = await Formation.updateOne(
          { cle_ministere_educatif },
          { $set: { ...removeFields({ ...dcFormation }, notToCompare) } }
        );
        console.log(result);

        result.nModified ? updated++ : notUpdated++;
        // const difference = diff(
        //   removeFields({ ...formation }, notToCompare),
        //   removeFields({ ...dcFormation }, notToCompare)
        // );
        // if (!difference || !Object.keys(difference).length) {
        //   notUpdated++;
        //   return;
        // }

        // updated++;

        // // Recalcule des champs à recalculer
        // console.log(difference);

        // const result = await Formation.updateOne({ cle_ministere_educatif }, { $set: { ...difference } });
        // console.log(result);
      }
      // Si la formation n'existe pas
      else {
        console.warn(`${dcFormation.cle_ministere_educatif} not found`);
        added++;

        toSave = new Formation(dcFormation);
        // Recalcule des champs à recalculer

        toSave.save();
      }

      // Sauvegarde de la formation
      // console.log({ toSave });
      // toSave.save();
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
