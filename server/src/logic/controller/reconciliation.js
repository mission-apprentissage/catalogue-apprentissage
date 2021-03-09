const { AfReconciliation, AfFormation, ConvertedFormation } = require("../../common/model");

async function reconciliationAffelnet(formation, match) {
  let { uai, code_cfd, _id, code_nature, etablissement_type, code_mef } = formation;
  let {
    uai_formation,
    etablissement_formateur_uai,
    etablissement_gestionnaire_uai,
    etablissement_formateur_siret,
    etablissement_gestionnaire_siret,
    _id: convertedId,
  } = match;

  let a = uai_formation === uai;
  let b = etablissement_formateur_uai === uai;
  let c = etablissement_gestionnaire_uai === uai;

  if (!uai_formation || !etablissement_formateur_uai || !etablissement_gestionnaire_uai) {
    if (a || b || c) {
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
  } else {
    await AfFormation.findByIdAndUpdate(_id, { no_uai: true });
  }
}

module.exports = { reconciliationAffelnet };
