const { ConvertedFormation, PsReconciliation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { paginator } = require("../../common/utils/paginator");

const run = async () => {
  // 1 - reset "publié" to "hors périmètre"
  await ConvertedFormation.updateMany(
    { parcoursup_statut: "publié" },
    { $set: { parcoursup_statut: "hors périmètre", parcoursup_reference: false } }
  );

  // check for published trainings in psup (set "publié") / but don't overwrite those on "non publié" status : it means a user chose not to publish
  await paginator(PsReconciliation, { filter: { unpublished_by_user: null } }, async (reconciliation) => {
    await ConvertedFormation.updateMany(
      {
        published: true,
        etablissement_reference_catalogue_published: true,
        parcoursup_statut: { $ne: "non publié" },
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
      { $set: { last_update_at: Date.now(), parcoursup_reference: true, parcoursup_statut: "publié" } }
    );
  });

  // 4 - stats
  const totalPublished = await ConvertedFormation.countDocuments({ published: true });
  const totalPsPublished = await ConvertedFormation.countDocuments({ published: true, parcoursup_statut: "publié" });
  logger.info(`Total formations publiées sur ParcourSup : ${totalPsPublished}/${totalPublished}`);
};

module.exports = { run };
