const { paginator } = require("../../common/utils/paginator");
const { PsFormation2021, PsReconciliation } = require("../../../common/model");
const { runScript } = require("../../scriptWrapper");
const logger = require("../../../common/logger");

const psReconciliation = async () => {
  try {
    logger.info(`Start parcoursup reconciliation`);

    await paginator(
      PsFormation2021,
      { filter: { matching_mna_formation: { $size: 1 } }, lean: true, limit: 200 },
      async ({ code_cfd, matching_mna_formation, _id, uai_gestionnaire, uai_composante, uai_affilie }) => {
        let { etablissement_formateur_siret, etablissement_gestionnaire_siret } = matching_mna_formation[0];

        let payload = {
          uai_gestionnaire,
          uai_composante,
          uai_affilie,
          code_cfd,
          siret_formateur: etablissement_formateur_siret,
          siret_gestionnaire: etablissement_gestionnaire_siret,
        };

        await PsReconciliation.findOneAndUpdate({ uai_affilie, uai_composante, uai_gestionnaire, code_cfd }, payload, {
          upsert: true,
        });
        await PsFormation2021.findByIdAndUpdate(_id, { etat_reconciliation: true });
      }
    );

    logger.info(`End parcoursup reconciliation`);
  } catch (error) {
    logger.error(error);
  }
};

module.exports = psReconciliation;

if (process.env.standalone) {
  runScript(async () => {
    await psReconciliation();
  });
}
