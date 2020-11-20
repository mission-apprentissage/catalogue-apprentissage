const axios = require("axios");
const logger = require("../../common/logger");

// Cf Documentation : https://mission-apprentissage.gitbook.io/catalogue/integration/api
const apiEndpoint = "https://c7a5ujgw35.execute-api.eu-west-3.amazonaws.com/prod";

const getEtablissements = async (query, page = 1, limit = 100) => {
  try {
    const response = await axios.get(`${apiEndpoint}/etablissements/`, { params: { page, limit, query } });
    return response.data;
  } catch (error) {
    logger.error(error);
  }
};

const getEtablissement = async (query) => {
  try {
    const response = await axios.get(`${apiEndpoint}/etablissement/`, { params: { query } });
    return response.data;
  } catch (error) {
    logger.error(error);
  }
};

const getEtablissementById = async (idEtablissement) => {
  try {
    const response = await axios.get(`${apiEndpoint}/etablissement/${idEtablissement}`);
    return response.data;
  } catch (error) {
    logger.error(error);
  }
};

module.exports = { getEtablissements, getEtablissementById, getEtablissement };
