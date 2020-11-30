/**
 * Méthode lié à l'ancien catalogue
 */
const axios = require("axios");
const logger = require("../logger");

const apiEndpoint = "https://c7a5ujgw35.execute-api.eu-west-3.amazonaws.com/prod";

const getEtablissements = async (options) => {
  let { page, allEtablissements, limit, query } = { page: 1, allEtablissements: [], limit: 1050, ...options };
  let params = { page, limit, query };

  logger.debug(`Requesting ${apiEndpoint}/etablissements with parameters`, params);
  try {
    const response = await axios.get(`${apiEndpoint}/etablissements`, { params });

    const { etablissements, pagination } = response.data;
    allEtablissements = allEtablissements.concat(etablissements);

    if (page < pagination.nombre_de_page) {
      return getEtablissements({ page: page + 1, allEtablissements, limit });
    } else {
      return allEtablissements;
    }
  } catch (error) {
    logger.error(error);
    return null;
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

module.exports = () => {
  return {
    getEtablissements: (opt) => getEtablissements(opt),
    getEtablissement: (opt) => getEtablissement(opt),
    getEtablissementById: (opt) => getEtablissementById(opt),
  };
};
