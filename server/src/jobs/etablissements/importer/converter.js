const { Etablissement, Formation, DualControlEtablissement } = require("../../../common/model/index");
const { diff } = require("deep-object-diff");
const { isValideUAI } = require("@mission-apprentissage/tco-service-node");
const { cursor } = require("../../../common/utils/cursor");
const logger = require("../../../common/logger");

const updateRelationFields = async () => {
  logger.info(" == Updating relations for etablissements == ");

  await cursor(Etablissement.find({}).sort(), async (etablissement) => {
    await Etablissement.updateOne(
      { _id: etablissement._id },
      { $set: { ...(await computeRelationFields(etablissement)) } }
    );
  });

  logger.info(" == Updating relations for etablissements: DONE == ");
};

const computeRelationFields = async (fields) => {
  const etablissement_siege_id = (await Etablissement.findOne({ siret: fields.etablissement_siege_siret }))?.id;

  const formations = await Formation.find({
    $or: [{ etablissement_gestionnaire_siret: fields.siret }, { etablissement_formateur_siret: fields.siret }],
  });

  const formation_ids = formations?.map((formation) => formation._id) ?? [];
  const formation_uais = formations?.map((formation) => formation.uai_formation) ?? [];

  return {
    etablissement_siege_id,
    formation_ids,
    formation_uais,
  };
};

const recomputeFields = async (fields) => {
  const uai_valide = !fields.uai || (await isValideUAI(fields.uai));

  return {
    uai_valide,

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
  const result = await Etablissement.updateMany(
    {
      siret: { $nin: await DualControlEtablissement.distinct("siret") },
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
      // console.debug(siret);
      const dcEtablissement = await DualControlEtablissement.findOne({ siret }).lean();
      const etablissement = await Etablissement.findOne({ siret }).lean();

      // console.log("================================");
      // console.log({ etablissement, dcEtablissement });
      // console.log("================================");

      // Si l'établissement existe
      if (etablissement) {
        const notToCompare = ["_id", "__v", "created_at", "updated_at", "last_updated_at"];

        await Etablissement.updateOne(
          { siret },
          { $set: { ...(await recomputeFields(removeFields({ ...dcEtablissement }, notToCompare))) } },
          { timestamps: false }
        );

        const newEtablissement = await Etablissement.findById(etablissement._id).lean();

        const differences = Object.entries(diff(etablissement, newEtablissement));
        // console.debug(differences);
        differences.length ? updated++ : notUpdated++;

        if (differences.length) {
          await Etablissement.updateOne({ siret }, { $set: { updated_at: new Date() } });
        }
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

module.exports = { converter, updateRelationFields };
