const { Etablissement, Formation, DualControlEtablissement } = require("../../../common/model/index");
const { diff } = require("deep-object-diff");
const { isValideUAI } = require("@mission-apprentissage/tco-service-node");
const { cursor } = require("../../../common/utils/cursor");

const recomputeFields = async (fields) => {
  const uai_valide = !fields.uai || (await isValideUAI(fields.uai));
  const etablissement_siege_id = (await Etablissement.find({ siret: fields.etablissement_siege_siret }))?.id;

  const formations = await Formation.find({
    $or: [{ etablissement_gestionnaire_siret: fields.siret }, { etablissement_formateur_siret: fields.siret }],
  });

  const formation_ids = formations?.map((formation) => formation._id) ?? [];
  const formation_uais = formations?.map((formation) => formation.uai_formation) ?? [];

  const published = !fields.ferme && fields.api_etablissement_reference;

  return {
    uai_valide,

    // TODO :
    etablissement_siege_id,
    formation_ids,
    formation_uais,
    published,

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
  const result = await Etablissement.updateMany(
    {
      siret: { $in: await DualControlEtablissement.distinct("siret") },
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
    DualControlEtablissement.find().sort(),

    async ({ siret }) => {
      const dcEtablissement = await DualControlEtablissement.findOne({ siret }).lean();
      const etablissement = await Etablissement.findOne({ siret }).lean();

      // console.log("================================");
      // console.log({ etablissement, dcEtablissement });
      // console.log("================================");

      // Si l'établissement existe
      if (etablissement) {
        const toRestore = [];

        const toRecompute = ["etablissement_ids", "etablissement_uais", "uai_valide"];

        // TODO : to Remove before first conversion
        const toDelete = [];

        const notToCompare = ["_id", "__v", "created_at", "last_update_at", ...toDelete, ...toRestore, ...toRecompute];

        await Etablissement.updateOne(
          { siret },
          { $set: { ...(await recomputeFields(removeFields({ ...dcEtablissement }, notToCompare))) } }
        );

        const newEtablissement = await Etablissement.findById(etablissement._id).lean();

        Object.keys(diff(etablissement, newEtablissement)).length ? updated++ : notUpdated++;
      }

      // Si l'établissement n'existe pas
      else {
        console.warn(`${dcEtablissement.siret} not found`);
        added++;

        await Etablissement.create(await recomputeFields({ ...dcEtablissement }));
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
