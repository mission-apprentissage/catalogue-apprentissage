const { Formation, AfReconciliation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { paginator } = require("../../../common/utils/paginator");

const run = async () => {
  // 1 - reset "publié" to "hors périmètre"
  await Formation.updateMany(
    { affelnet_statut: "publié" },
    { $set: { affelnet_statut: "hors périmètre", affelnet_reference: false } }
  );

  //  check for published trainings in affelnet (set "publié") / but don't overwrite those on "non publié" status : it means a user chose not to publish
  await paginator(AfReconciliation, { filter: { unpublished_by_user: null } }, async (reconciliation) => {
    await Formation.updateMany(
      {
        published: true,
        etablissement_reference_catalogue_published: true,
        affelnet_statut: { $ne: "non publié" },
        cfd_outdated: { $ne: true },
        mefs_10: { $ne: null },
        niveau: { $in: ["3 (CAP...)", "4 (BAC...)"] },
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
  const totalPublished = await Formation.countDocuments({ published: true });
  const totalAfPublished = await Formation.countDocuments({ published: true, affelnet_statut: "publié" });
  logger.info(`Total formations publiées sur Affelnet : ${totalAfPublished}/${totalPublished}`);
};

module.exports = { run };
