const { RcoFormation } = require("../../../common/model/index");
const { runScript } = require("../../scriptWrapper");
const catalogue = require("../../../common/components/catalogue_old");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const logger = require("../../../common/logger");

const addTagsIfNeeded = async (rcoFormation, i, arr) => {
  logger.info(`update tags of etablissements from converted rco formation ${i}/${arr.length}`);

  const siretKeys = [
    "etablissement_gestionnaire_siret",
    "etablissement_formateur_siret",
    "etablissement_lieu_formation_siret",
  ];
  const handledSirets = [];

  await asyncForEach(siretKeys, async (key) => {
    const siret = rcoFormation[key];
    if (!siret || handledSirets.includes(siret)) {
      return;
    }

    let etablissement = await catalogue().getEtablissement({ siret });
    if (etablissement?._id && !etablissement?.tags?.includes("2021")) {
      await catalogue().updateEtablissement(etablissement._id, {
        tags: [...etablissement.tags, "2021"],
      });
    }

    handledSirets.push(siret);
  });
};

const run = async () => {
  // 1 loop on all etablissements, add 2020 tag
  const allEtablissements = await catalogue().getEtablissements();

  await asyncForEach(allEtablissements, async (item, i, arr) => {
    logger.info(`update tags of all etablissements ${i}/${arr.length}`);

    if (item?._id && !item?.tags?.includes("2020")) {
      await catalogue().updateEtablissement(item._id, {
        tags: [...item.tags, "2020"],
      });
    }
  });

  // 2 loop on converted: true RCO formations, get Etablissements for each --> tag 2021 etablissement
  const convertedRCOFormations = await RcoFormation.find({ converted_to_mna: true });
  await asyncForEach(convertedRCOFormations, addTagsIfNeeded);
};

runScript(async () => {
  await run();
});
