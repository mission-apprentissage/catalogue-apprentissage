const { runScript } = require("../../scriptWrapper");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
// const { PsReconciliation, PsFormation2021 } = require("../../../common/model");
const { PsFormation2021 } = require("../../../common/model");

runScript(async () => {
  await migrate();
});

async function migrate() {
  const dataset = await PsFormation2021.find({}).lean();
  console.log(dataset.length);

  await asyncForEach(dataset, async (psFormation2021) => {
    const {
      _id,
      // uai_gestionnaire,
      // uai_composante,
      // uai_affilie,
      // code_cfd,
      // etat_reconciliation,
      // matching_mna_etablissement,
    } = psFormation2021;

    // if (etat_reconciliation) {
    //   let matching = await PsReconciliation.find({
    //     uai_gestionnaire,
    //     uai_composante,
    //     uai_affilie,
    //     code_cfd,
    //   }).lean();
    //   console.log(matching);
    //   if (matching.length > 1) {
    //     const sirets = matching_mna_etablissement.reduce((acc, { siret }) => {
    //       return [...acc, siret];
    //     }, []);
    //     matching = await PsReconciliation.find({
    //       $or: [
    //         {
    //           siret_formateur: { $in: sirets },
    //         },
    //         {
    //           siret_gestionnaire: { $in: sirets },
    //         },
    //       ],
    //       uai_gestionnaire,
    //       uai_composante,
    //       uai_affilie,
    //       code_cfd,
    //     }).lean();
    //   }
    //   if (matching.length !== 1) {
    //     console.log("Oups");
    //   } else {
    //     const [reconciliationEntry] = matching;
    //     let statut_reconciliation = "INCONNU";
    //     if (!reconciliationEntry.source || reconciliationEntry.source === "MANUEL") {
    //       statut_reconciliation = "VALIDE"; // TODO We Actually want to reset => "INCONNU"
    //     } else if (reconciliationEntry.source === "AUTOMATIQUE") {
    //       statut_reconciliation = "AUTOMATIQUE";
    //     }

    //     await PsFormation2021.findByIdAndUpdate(_id, {
    //       statut_reconciliation,
    //       id_reconciliation: reconciliationEntry._id,
    //     });
    //   }
    // } else {
    await PsFormation2021.findByIdAndUpdate(_id, {
      statut_reconciliation: "INCONNU",
      id_reconciliation: null,
      etat_reconciliation: false,
    });
    // }
  });
}
