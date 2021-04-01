const {
  AfReconciliation,
  AfFormation,
  ConvertedFormation,
  PsFormation2021,
  PsReconciliation,
} = require("../../common/model");

async function reconciliationAffelnet(formation, source = "MANUEL") {
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

  let { etablissement_formateur_siret, etablissement_gestionnaire_siret, _id: convertedId } = matching_mna_formation[0];

  if (!uai) {
    await AfFormation.findByIdAndUpdate(_id, {
      no_uai: true,
      etat_reconciliation: false,
    });
    return;
  }

  let payload = {
    uai,
    code_cfd,
    siret_formateur: etablissement_formateur_siret,
    siret_gestionnaire: etablissement_gestionnaire_siret,
    source,
  };

  await AfReconciliation.findOneAndUpdate({ uai, code_cfd }, payload, { upsert: true });

  await AfFormation.findByIdAndUpdate(_id, {
    etat_reconciliation: true,
  });

  // pass through some data for Affelnet
  const converted = await ConvertedFormation.findById(convertedId, {
    affelnet_infos_offre: 1,
    bcn_mefs_10: 1,
  }).lean();
  if (converted) {
    const update = {};
    update.affelnet_code_nature = code_nature;
    update.affelnet_secteur = etablissement_type === "Public" ? "PU" : "PR";

    // pre-fill affelnet_infos_offre with data from affelnet import if empty (to not erase user change)
    update.affelnet_infos_offre = converted.affelnet_infos_offre || libelle_mnemonique;

    const mefs_10 = converted.bcn_mefs_10 ?? [];
    const mef = mefs_10.find(({ mef10 }) => mef10 === code_mef.substring(0, 10));
    if (mef) {
      update.mefs_10 = [mef];
    } else {
      update.mefs_10 = [
        {
          mef10: code_mef,
          modalite: {
            duree: !["", "AFFECTATION"].includes(code_mef) ? code_mef.substring(8, 9) : "",
            annee: !["", "AFFECTATION"].includes(code_mef) ? code_mef.substring(9, 10) : "",
          },
        },
      ];
    }
    await ConvertedFormation.findByIdAndUpdate(convertedId, update);
  }
}

async function reconciliationParcoursup(formation, source = "MANUEL") {
  let { code_cfd, matching_mna_formation, _id, uai_gestionnaire, uai_composante, uai_affilie } = formation;
  let { etablissement_formateur_siret, etablissement_gestionnaire_siret } = matching_mna_formation[0];

  let payload = {
    uai_gestionnaire,
    uai_composante,
    uai_affilie,
    code_cfd,
    siret_formateur: etablissement_formateur_siret,
    siret_gestionnaire: etablissement_gestionnaire_siret,
    source,
  };

  await PsReconciliation.findOneAndUpdate({ uai_affilie, uai_composante, uai_gestionnaire, code_cfd }, payload, {
    upsert: true,
  });
  await PsFormation2021.findByIdAndUpdate(_id, { etat_reconciliation: true });
}

module.exports = { reconciliationAffelnet, reconciliationParcoursup };
