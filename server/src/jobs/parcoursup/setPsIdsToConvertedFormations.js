const { paginator } = require("../../common/utils/paginator");
const { PsReconciliation, ConvertedFormation } = require("../../common/model");
const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");

const setPsIds = async () => {
  try {
    logger.info(`Start parcoursup set ids`);
    await ConvertedFormation.updateMany({}, { $set: { parcoursup_ids: [] } });

    await paginator(PsReconciliation, { filter: {} }, async (reconciliation) => {
      await ConvertedFormation.updateMany(
        {
          published: true,
          etablissement_reference_catalogue_published: true,
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
        { $set: { last_update_at: Date.now(), parcoursup_ids: reconciliation.ids_parcoursup } }
      );
    });

    logger.info(`End parcoursup parcoursup set ids`);
  } catch (error) {
    logger.error(error);
  }
};

module.exports = setPsIds;

if (process.env.standalone) {
  runScript(async () => {
    await setPsIds();
  });
}
