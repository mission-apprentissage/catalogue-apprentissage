const { paginator } = require("../../common/utils/paginator");
const { AfFormation, AfReconciliation } = require("../../../common/model");
const { runScript } = require("../../scriptWrapper");

runScript(async () => {
  await paginator(
    AfFormation,
    { filter: { matching_mna_etablissement: { $size: 1 } }, lean: true, limit: 50 },
    async ({ code_cfd, matching_mna_etablissement, _id }) => {
      let { siret, uai } = matching_mna_etablissement[0];

      let payload = {
        uai,
        code_cfd,
        siret_formateur: siret,
        siret_gestionnaire: siret,
      };

      await AfReconciliation.create(payload);
      await AfFormation.findByIdAndUpdate(_id, { etat_reconciliation: true });
    }
  );
});
