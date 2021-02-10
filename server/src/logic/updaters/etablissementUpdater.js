const { asyncForEach } = require("../../common/utils/asyncUtils");
const catalogue = require("../../common/components/catalogue");
const { Etablissement } = require("../../common/model/index");

const getRCOEtablissementFields = (rcoFormation, prefix) => {
  return {
    rco_uai: rcoFormation[`${prefix}_uai`] || null,
    rco_geo_coordonnees: rcoFormation[`${prefix}_geo_coordonnees`] || null,
    rco_code_postal: rcoFormation[`${prefix}_code_postal`] || null,
    rco_adresse: rcoFormation[`${prefix}_adresse`] || null,
    rco_code_insee_localite: rcoFormation[`${prefix}_code_insee`] || null,
  };
};
const getEtablissementData = (rcoFormation, prefix) => {
  return {
    siret: rcoFormation[`${prefix}_siret`] || null,
    uai: rcoFormation[`${prefix}_uai`] || null,
    geo_coordonnees: rcoFormation[`${prefix}_geo_coordonnees`] || null,
    ...getRCOEtablissementFields(rcoFormation, prefix),
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

const handledSirets = [];

/**
 * Create or update etablissements
 */
const createOrUpdateEtablissements = async (rcoFormation) => {
  const etablissementTypes = [
    "etablissement_gestionnaire",
    "etablissement_formateur" /*, "etablissement_lieu_formation"*/,
  ];

  await asyncForEach(etablissementTypes, async (type) => {
    const data = getEtablissementData(rcoFormation, type);
    if (!data.siret || handledSirets.includes(data.siret)) {
      return;
    }

    const years = ["2020", "2021"];
    const tags = years.filter((year) => rcoFormation.periode?.some((p) => p.includes(year)));
    if (tags.length === 0) {
      return;
    }

    handledSirets.push(data.siret);
    let etablissement = await Etablissement.findOne({ siret: data.siret });
    if (!etablissement?._id) {
      // create remote etablissement & save locally
      etablissement = await catalogue().createEtablissement({ ...data, tags });
      await Etablissement.create(etablissement);
      return;
    }

    let updates = {};
    const rcoFields = getRCOEtablissementFields(rcoFormation, type);

    if (!areEtablissementFieldsEqual(rcoFields, etablissement) && !areRCOFieldsEqual(rcoFields, etablissement)) {
      updates = {
        ...updates,
        ...rcoFields,
      };
    }

    const tagsToAdd = tags.filter((tag) => !etablissement?.tags?.includes(tag));
    if (tagsToAdd.length > 0) {
      updates.tags = [...etablissement.tags, ...tagsToAdd];
    }

    if (Object.keys(updates).length > 0) {
      // update remote etablissement & save locally
      await catalogue().updateEtablissement(etablissement._id, updates);
      await Etablissement.findOneAndUpdate({ siret: data.siret }, updates);
    }
  });
};

module.exports = { createOrUpdateEtablissements };
