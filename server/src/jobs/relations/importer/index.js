const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { Relation, Formation, CandidatureRelation } = require("../../../common/models/index");
const { cursor } = require("../../../common/utils/cursor");
const { diffEntity, buildUpdatesHistory } = require("../../../logic/common/utils/diffUtils");

const getCandidatureEmail = async ({ siret_responsable, siret_formateur }) => {
  const candidatureRelation = await CandidatureRelation.findOne({
    siret_responsable,
    siret_formateur,
  });

  return candidatureRelation?.email_responsavle;
};

const getRCOEmail = async ({ siret_responsable, siret_formateur }) => {
  const formations = await Formation.find({
    published: true,
    catalogue_published: true,
    etablissement_gestionnaire_siret: siret_responsable,
  });

  const emails = new Set([...formations.map((etablissement) => etablissement.etablissement_gestionnaire_courriel)]);

  if (emails.size === 1 && emails[0]?.length) {
    return emails[0];
  } else return null;
};

const run = async () => {
  try {
    logger.info({ type: "job" }, " -- RELATIONS IMPORTER : ⏳ -- ");

    await cursor(Formation.find({ published: true, catalogue_published: true }), async (formation) => {
      const siret_responsable = formation.etablissement_gestionnaire_siret;
      const siret_formateur = formation.etablissement_formateur_siret;

      let relation = await Relation.findOne({
        siret_responsable,
        siret_formateur,
      }).lean();

      if (!relation) {
        // logger.info({ type: "job" }, "Creating relation");
        await Relation.create({
          siret_responsable,
          siret_formateur,
        });

        relation = await Relation.findOne({
          siret_responsable,
          siret_formateur,
        }).lean();
      }

      if (!relation.editedFields?.email_responsable) {
        const updatedRelation = {
          ...relation,
          email_responsable:
            (await getCandidatureEmail({
              siret_responsable,
              siret_formateur,
            })) ??
            (await getRCOEmail({
              siret_responsable,
              siret_formateur,
            })),
        };

        const { updates, keys, length } = diffEntity(relation, updatedRelation);

        if (length) {
          console.log({ relation, updatedRelation, updates, keys, length });
          logger.info({ type: "job" }, "Updating relation");

          await Relation.updateOne(
            {
              _id: relation._id,
            },
            {
              $set: updates,
              ...(length ? { $push: { updates_history: buildUpdatesHistory(relation, updatedRelation) } } : {}),
            }
          );
        }
      }
    });

    logger.info({ type: "job" }, " -- RELATIONS IMPORTER : ✅ -- ");
  } catch (error) {
    logger.error({ type: "job" }, error);
    logger.error({ type: "job" }, " -- RELATIONS IMPORTER : ❌ -- ");
  }
};

module.exports = { run };

if (process.env.standalone) {
  runScript(async () => {
    await run();
  });
}
