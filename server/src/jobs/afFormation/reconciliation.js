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
      async ({ code_cfd, matching_mna_formation, _id, uai, code_nature, etablissement_type, code_mef }) => {
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
        const converted = await ConvertedFormation.findById(convertedId);
        if (converted) {
          converted.affelnet_code_nature = code_nature;
          converted.affelnet_secteur = etablissement_type === "Public" ? "PU" : "PR";

          const mefs_10 = converted.mefs_10 ?? [];
          if (mefs_10.some(({ mef10 }) => mef10 === code_mef)) {
            converted.affelnet_mef_10_code = code_mef;
          }
          await converted.save();
        }
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
