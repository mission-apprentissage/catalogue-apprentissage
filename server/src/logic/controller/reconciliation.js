const {
  AfReconciliation,
  AfFormation,
  ConvertedFormation,
  PsFormation2021,
  PsReconciliation,
} = require("../../common/model");

async function reconciliationAffelnet(formation) {
  let {
    uai,
    code_cfd,
    _id,
    code_nature,
    etablissement_type,
    code_mef,
    matching_mna_formation,
    libelle_mnemonique,
  } = formation;

  let {
    uai_formation,
    etablissement_formateur_uai,
    etablissement_gestionnaire_uai,
    etablissement_formateur_siret,
    etablissement_gestionnaire_siret,
    _id: convertedId,
  } = matching_mna_formation[0];

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

        // pre-fill affelnet_infos_offre with data from affelnet import if empty (to not erase user change)
        converted.affelnet_infos_offre = converted.affelnet_infos_offre || libelle_mnemonique;

        const mefs_10 = converted.bcn_mefs_10 ?? [];
        const mef = mefs_10.find(({ mef10 }) => mef10 === code_mef);
        if (mef) {
          converted.mefs_10 = [mef];
        }
        await converted.save();
      }
    }
  } else {
    await AfFormation.findByIdAndUpdate(_id, { no_uai: true });
  }
}

async function reconciliationParcoursup(formation) {
  let { code_cfd, matching_mna_formation, _id, uai_gestionnaire, uai_composante, uai_affilie } = formation;
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

module.exports = { reconciliationAffelnet, reconciliationParcoursup };
