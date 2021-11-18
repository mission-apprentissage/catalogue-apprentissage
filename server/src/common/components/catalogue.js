const logger = require("../logger");
const { Etablissement } = require("../model");
const { getEtablissementUpdates } = require("@mission-apprentissage/tco-service-node");

const createEtablissement = async (payload) => {
  if (!payload.siret) {
    logger.error("Missing siret from payload");
    return null;
  }

  const exist = await Etablissement.findOne({
    siret: payload.siret,
  });
  if (exist) {
    logger.error("L'etablissement existe déjà");
    return null;
  }

  try {
    const { etablissement, error } = await getEtablissementUpdates(payload);
    if (error) {
      logger.error("Error during etablissement creation", error);
      return null;
    }

    logger.info("Create etablissement with data", etablissement);
    const newEtablissement = new Etablissement(etablissement);
    await newEtablissement.save();
    return newEtablissement;
  } catch (error) {
    logger.error("Error during etablissement creation", error);
    return null;
  }
};

module.exports = {
  createEtablissement,
};
