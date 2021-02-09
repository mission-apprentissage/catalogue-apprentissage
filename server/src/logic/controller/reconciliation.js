const { AfReconciliation, AfFormation } = require("../../common/model");

async function reconciliationAffelnet(formation, match) {
  let { uai, code_cfd, _id } = formation;
  let {
    uai_formation,
    etablissement_formateur_uai,
    etablissement_gestionnaire_uai,
    etablissement_formateur_siret,
    etablissement_gestionnaire_siret,
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
    }
  } else {
    await AfFormation.findByIdAndUpdate(_id, { no_uai: true });
  }
}

module.exports = { reconciliationAffelnet };
