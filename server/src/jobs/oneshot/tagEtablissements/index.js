const { RcoFormation } = require("../../../common/model/index");
const { runScript } = require("../../scriptWrapper");
const catalogue = require("../../../common/components/catalogue_old");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const logger = require("../../../common/logger");

const getRCOEtablissementFields = (rcoFormation, prefix) => {
  return {
    rco_uai: rcoFormation[`${prefix}_uai`] || null,
    rco_geo_coordonnees: rcoFormation[`${prefix}_geo_coordonnees`] || null,
    rco_code_postal: rcoFormation[`${prefix}_code_postal`] || null,
    rco_adresse: rcoFormation[`${prefix}_adresse`] || null,
    rco_code_insee_localite: rcoFormation[`${prefix}_code_insee`] || null,
  };
};

const areEtablissementFieldsEqual = (rcoFields, etablissement) => {
  const keyMap = {
    rco_uai: "uai",
    rco_geo_coordonnees: "geo_coordonnees",
    rco_code_postal: "code_postal",
    rco_adresse: "adresse",
    rco_code_insee_localite: "code_insee_localite",
  };
  return Object.entries(rcoFields).every(([key, value]) => etablissement[keyMap[key]] === value);
};

const areRCOFieldsEqual = (rcoFields, etablissement) => {
  return Object.entries(rcoFields).every(([key, value]) => etablissement[key] === value);
};

const addTagsIfNeeded = async (rcoFormation, i, arr) => {
  logger.info(`update tags of etablissements from converted rco formation ${i}/${arr.length}`);

  const types = ["etablissement_gestionnaire", "etablissement_formateur", "etablissement_lieu_formation"];
  const handledSirets = [];

  await asyncForEach(types, async (type) => {
    const siret = rcoFormation[`${type}_siret`];
    if (!siret || handledSirets.includes(siret)) {
      return;
    }

    let etablissement = await catalogue().getEtablissement({ siret });
    if (etablissement?._id) {
      let updates = {};
      const rcoFields = getRCOEtablissementFields(rcoFormation, type);

      if (!areEtablissementFieldsEqual(rcoFields, etablissement) && !areRCOFieldsEqual(rcoFields, etablissement)) {
        updates = {
          ...updates,
          ...rcoFields,
        };
      }

      if (!etablissement?.tags?.includes("2021")) {
        updates.tags = [...etablissement.tags, "2021"];
      }

      if (Object.keys(updates).length > 0) {
        await catalogue().updateEtablissement(etablissement._id, updates);
      }
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
