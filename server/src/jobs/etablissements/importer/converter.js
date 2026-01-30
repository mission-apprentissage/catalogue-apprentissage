const config = require("config");
const { Etablissement, Formation, DualControlEtablissement } = require("../../../common/models/index");
const { diff } = require("deep-object-diff");
const { cursor } = require("../../../common/utils/cursor");
const logger = require("../../../common/logger");
const { validateUAI } = require("../../../common/utils/uaiUtils");

const updateRelationFields = async () => {
  logger.info({ type: "job" }, " == Updating relations for etablissements == ");

  await cursor(Etablissement.find({ published: true }), async (etablissement) => {
    const updates = await computeRelationFields(etablissement);
    await Etablissement.updateOne({ _id: etablissement._id }, { $set: updates });
  });

  logger.info({ type: "job" }, " == Updating relations for etablissements: DONE == ");
};

const computeRelationFields = async (fields) => {
  console.log();

  const etablissement_siege_id =
    (await Etablissement.findOne({ siret: fields.etablissement_siege_siret }))?._id ?? null;

  const emails_potentiels = [
    ...new Set(
      (
        await Formation.find(
          {
            published: true,
            catalogue_published: true,
            affelnet_perimetre: true,
            affelnet_session: true,
            etablissement_gestionnaire_siret: fields.siret,
          },
          { _id: 0, etablissement_gestionnaire_courriel: 1 }
        ).lean()
      )
        .filter((f) => !!f.etablissement_gestionnaire_courriel?.length)
        .map((f) => f.etablissement_gestionnaire_courriel)
    ),
  ];

  // logger.debug({ type: "job" }, { siret: fields.siret, emails_potentiels });

  const email_direction =
    fields?.editedFields?.email_direction ?? (emails_potentiels.length === 1 ? [...emails_potentiels][0] : null);

  const formations = await Formation.find({
    published: true,
    $or: [{ etablissement_gestionnaire_siret: fields.siret }, { etablissement_formateur_siret: fields.siret }],
  });

  const formations_ids = [
    ...new Set(formations?.map((formation) => formation._id).filter((value) => !["", null].includes(value)) ?? []),
  ];
  const formations_uais = [
    ...new Set(
      formations?.map((formation) => formation.uai_formation).filter((value) => !["", null].includes(value)) ?? []
    ),
  ];

  const previous = {
    etablissement_siege_id: fields.etablissement_siege_id,
    email_direction: fields.email_direction,
    emails_potentiels: fields.emails_potentiels,
    formations_ids: fields.formations_ids,
    formations_uais: fields.formations_uais,
  };
  const next = {
    etablissement_siege_id,
    email_direction,
    emails_potentiels,
    formations_ids,
    formations_uais,
  };

  const differences = diff(previous, next);

  logger.debug(
    { type: "job" },
    {
      siret: fields.siret,
      // previous,
      // next,
      differences,
    }
  );

  return next;
};

const recomputeFields = async (fields) => {
  const uai_valide = !fields.uai || (await validateUAI(fields.uai));

  const raison_sociale_enseigne = `${fields.entreprise_raison_sociale}${fields.enseigne ? ` (${fields.enseigne})` : ""}`;

  return {
    uai_valide,

    raison_sociale_enseigne,

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
      const dcEtablissement = await DualControlEtablissement.findOne({ siret }).lean();
      const etablissement = await Etablissement.findOne({ siret }).lean();

      // console.log("================================");
      // console.log({ siret, etablissement, dcEtablissement });
      // console.log("================================");

      // Si l'établissement existe
      if (etablissement) {
        const notToCompare = ["_id", "__v", "created_at", "updated_at", "last_updated_at"];

        const result = await Etablissement.updateOne(
          { siret },
          { $set: { ...(await recomputeFields(removeFields({ ...dcEtablissement }, notToCompare))) } },
          { timestamps: false }
        );

        if (result.nModified) {
          updated++;

          if (config.log?.level === "debug") {
            const newEtablissement = await Etablissement.findById(etablissement._id).lean();
            const differences = Object.entries(diff(etablissement, newEtablissement));
            logger.debug({ type: "job" }, { siret, differences });
          }

          await Etablissement.updateOne({ siret }, { $set: { updated_at: new Date() } });
        } else {
          notUpdated++;
        }
      }

      // Si l'établissement n'existe pas
      else {
        logger.debug({ type: "job" }, `Nouvel établissement : ${dcEtablissement.siret}`);
        // console.warn(` ${dcEtablissement.siret} not found`);
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
  } catch (error) {
    logger.error({ type: "job" }, error);
  }

  return error;
};

module.exports = { converter, updateRelationFields };
