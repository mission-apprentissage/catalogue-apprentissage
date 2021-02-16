const { RcoFormation, Etablissement } = require("../../../common/model/index");
const { runScript } = require("../../scriptWrapper");
const catalogue = require("../../../common/components/catalogue");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { getPeriodeTags } = require("../../common/utils/rcoUtils");
const { paginator } = require("../../common/utils/paginator");

const addTagsIfNeeded = async (rcoFormation) => {
  const types = ["etablissement_gestionnaire", "etablissement_formateur" /*, "etablissement_lieu_formation"*/];
  const handledSirets = [];

  await asyncForEach(types, async (type) => {
    const siret = rcoFormation[`${type}_siret`];
    if (!siret || handledSirets.includes(siret)) {
      return;
    }

    const tags = getPeriodeTags(rcoFormation.periode);
    if (tags.length === 0) {
      return;
    }

    let etablissement = await Etablissement.findOne({ siret });
    if (etablissement?._id) {
      let updates = {};

      const tagsToAdd = tags.filter((tag) => !etablissement?.tags?.includes(tag));
      if (tagsToAdd.length > 0) {
        updates.tags = [...etablissement.tags, ...tagsToAdd];
      }

      if (Object.keys(updates).length > 0) {
        await catalogue().updateEtablissement(etablissement._id, updates);
        await Etablissement.findOneAndUpdate({ siret }, updates);
      }
    }

    handledSirets.push(siret);
  });
};

const run = async () => {
  // Info - You may want to delete all tags of etablissements in tco DB before running this script
  // e.g :  db.getCollection('etablissements').updateMany({}, { $set: { tags: [] } })

  // 1 loop on converted: true RCO formations, get Etablissements for each --> tag 2021 etablissement
  await paginator(RcoFormation, { filter: { converted_to_mna: true }, lean: true }, addTagsIfNeeded);
};

runScript(async () => {
  await run();
});
