const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { PsFormation } = require("../../../common/model");
const { runScript } = require("../../scriptWrapper");
const logger = require("../../../common/logger");

const run = async (catalogue) => {
  const data = await PsFormation.find({
    matching_mna_etablissement: { $eq: null },
    matching_mna_formation: { $ne: null },
  }).lean();

  await asyncForEach(data, async ({ _id, matching_mna_formation }) => {
    logger.info(`formation ${_id}`);
    await asyncForEach(matching_mna_formation, async ({ etablissement_formateur_id, etablissement_responsable_id }) => {
      console.log(etablissement_formateur_id, etablissement_responsable_id);
      let merge = [];

      if (etablissement_formateur_id) {
        const formateur = await catalogue.getEtablissement({ _id: etablissement_formateur_id });
        merge.push({ ...formateur, matched_uai: ["UAI_FORMATEUR"] });
      }
      if (etablissement_responsable_id) {
        const etablissement = await catalogue.getEtablissement({ _id: etablissement_responsable_id });
        merge.push({ ...etablissement, matched_uai: ["UAI_GESTIONNAIRE"] });
      }

      await PsFormation.findByIdAndUpdate(_id, { matching_mna_etablissement: merge });
      logger.info(`${merge.length} etablissement ajouter`);
    });
  });
};

runScript(async ({ catalogue }) => {
  logger.info(`Start missing etablissement`);

  await run(catalogue);

  logger.info(`End missing etablissement`);
});
