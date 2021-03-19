const { ConvertedFormation, AfReconciliation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { paginator } = require("../../common/utils/paginator");

const run = async () => {
  await ConvertedFormation.updateMany({}, { $set: { last_update_at: Date.now(), affelnet_reference: false } });

  //  check for published trainings in affelnet (set "publié") / but don't overwrite those on "non publié" status : it means a user chose not to publish
  await paginator(AfReconciliation, { filter: { unpublished_by_user: null } }, async (reconciliation) => {
    await ConvertedFormation.updateMany(
      {
        published: true,
        etablissement_reference_catalogue_published: true,
        affelnet_statut: { $ne: "non publié" },
        cfd_outdated: { $ne: true },
        $or: [
          {
            cfd: reconciliation.code_cfd,
            etablissement_formateur_siret: reconciliation.siret_formateur,
            etablissement_gestionnaire_siret: reconciliation.siret_gestionnaire,
          },
          {
            cfd: reconciliation.code_cfd,
            etablissement_formateur_siret: reconciliation.siret_gestionnaire,
            etablissement_gestionnaire_siret: reconciliation.siret_formateur,
          },
        ],
      },
      { $set: { last_update_at: Date.now(), affelnet_reference: true, affelnet_statut: "publié" } }
    );
  });

  // 4 - stats
  const totalPublished = await ConvertedFormation.countDocuments({ published: true });
  const totalAfPublished = await ConvertedFormation.countDocuments({ published: true, affelnet_statut: "publié" });
  logger.info(`Total formations publiées sur Affelnet : ${totalAfPublished}/${totalPublished}`);
};

module.exports = { run };
