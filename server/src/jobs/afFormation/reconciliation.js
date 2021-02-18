const { paginator } = require("../common/utils/paginator");
const { AfFormation, AfReconciliation, ConvertedFormation } = require("../../common/model");
const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");

const afReconciliation = async () => {
  try {
    logger.info(`Start affelnet reconciliation`);

    await paginator(
      AfFormation,
      { filter: { matching_mna_formation: { $size: 1 } }, lean: true, limit: 200 },
      async ({ code_cfd, matching_mna_formation, _id, uai, code_nature, etablissement_type }) => {
        let {
          etablissement_formateur_siret,
          etablissement_gestionnaire_siret,
          _id: convertedId,
        } = matching_mna_formation[0];

        let payload = {
          uai,
          code_cfd,
          siret_formateur: etablissement_formateur_siret,
          siret_gestionnaire: etablissement_gestionnaire_siret,
        };

        await AfReconciliation.findOneAndUpdate({ uai, code_cfd }, payload, { upsert: true });
        await AfFormation.findByIdAndUpdate(_id, { etat_reconciliation: true });

        // pass through some data for Affelnet
        await ConvertedFormation.findByIdAndUpdate(convertedId, {
          affelnet_code_nature: code_nature,
          affelnet_secteur: etablissement_type === "Public" ? "PU" : "PR",
        });
      }
    );

    logger.info(`End affelnet reconciliation`);
  } catch (error) {
    logger.error(error);
  }
};

module.exports = afReconciliation;

if (process.env.standalone) {
  runScript(async () => {
    await afReconciliation();
  });
}
