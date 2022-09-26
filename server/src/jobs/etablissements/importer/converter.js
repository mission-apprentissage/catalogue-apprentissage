const { Etablissement, DualControlEtablissement } = require("../../../common/model/index");
const { diff } = require("deep-object-diff");
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
  // console.log(`before: ${await Etablissement.countDocuments({ rco_published: true })}`);

  const result = await Etablissement.updateMany(
    {
      siret: { $in: await DualControlEtablissement.distinct("siret") },
    },
    {
      $set: { published: false },
    }
  );

  // console.log(`after: ${await Etablissement.countDocuments({ rco_published: true })}`);

  return { removed: result.nModified };
};

const applyConversion = async () => {
  let added = 0,
    notUpdated = 0,
    updated = 0;

  await cursor(
    DualControlEtablissement.find().sort().limit(1),

    async ({ siret }) => {
      const dcEtablissement = await DualControlEtablissement.findOne({ siret }).lean();
      const etablissement = await Etablissement.findOne({ siret }).lean();

      // console.log("================================");
      // console.log({ etablissement, dcEtablissement });
      // console.log("================================");

      // Si la etablissement existe
      if (etablissement) {
        const toRestore = [];

        const toRecompute = [];

        // TODO : to Remove before first conversion
        const toDelete = ["rco_geo_coordonnees"];

        const notToCompare = ["_id", "__v", "created_at", "last_update_at", ...toDelete, ...toRestore, ...toRecompute];

        // const result = await Etablissement.updateOne(
        //   { siret },
        //   { $set: { ...removeFields({ ...dcEtablissement }, notToCompare) } }
        // );
        // console.log(result);

        // result.nModified ? updated++ : notUpdated++;
        const difference = diff(
          removeFields({ ...etablissement }, notToCompare),
          removeFields({ ...dcEtablissement }, notToCompare)
        );
        // if (!difference || !Object.keys(difference).length) {
        //   notUpdated++;
        //   return;
        // }

        console.log(difference);
        // updated++;

        // // Recalcule des champs à recalculer

        // const result = await Etablissement.updateOne({ siret }, { $set: { ...difference } });
        // console.log(result);
      }
      // Si la etablissement n'existe pas
      else {
        console.warn(`${dcEtablissement.siret} not found`);
        added++;
        await Etablissement.create(dcEtablissement);
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
