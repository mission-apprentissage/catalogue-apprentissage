const axios = require("axios");
const logger = require("../logger");
const config = require("config");
const { Etablissement } = require("../model");
const methods = ["post"];

const API = axios.create({ baseURL: `${config.tableCorrespondance.endpoint}/api` });
API.interceptors.request.use(async (req) => {
  if (methods.includes(req.method)) {
    let token = await getToken();
    req.headers.authorization = `Bearer ${token}`;
  }
  return req;
});

const getToken = async () => {
  try {
    let {
      data: { token },
    } = await axios.post(`${config.tableCorrespondance.endpoint}/api/login`, {
      username: `${config.tableCorrespondance.username}`,
      password: `${config.tableCorrespondance.password}`,
    });
    return token;
  } catch (error) {
    logger.error(error);
  }
};

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
    const { etablissement, error } = await etablissementService(payload);
    if (error) {
      logger.error("Error during etablissement creation", error);
      return null;
    }

    logger.info("Try to create etablissement with data", etablissement);
    const newEtablissement = new Etablissement(etablissement);
    await newEtablissement.save();
    return newEtablissement;
  } catch (error) {
    logger.error("Error during etablissement creation", error);
    return null;
  }
};

const etablissementService = async (payload, options) => {
  try {
    const {
      data: { updates, etablissement, error },
    } = await API.post(`/services/etablissement`, {
      ...payload,
      ...options,
    });

    return { updates, etablissement, error };
  } catch (error) {
    return { updates: null, etablissement: null, error };
  }
};

module.exports = {
  createEtablissement,
  etablissementService,
};
