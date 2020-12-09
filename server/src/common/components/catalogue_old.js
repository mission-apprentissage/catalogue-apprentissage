/**
 * Méthode lié à l'ancien catalogue
 */
const axios = require("axios");
const logger = require("../logger");
const config = require("config");

const apiEndpoint = config.oldCatalogue.endpoint;
const apiKey = config.oldCatalogue.apiKey;

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

const postEtablissement = async (payload) => {
  try {
    const response = await axios.post(`${apiEndpoint}/etablissement`, payload, {
      headers: { Authorization: `${apiKey}` },
    });
    return response.data;
  } catch (error) {
    logger.error(error);
  }
};

const deleteEtablissement = async (id) => {
  try {
    await axios.delete(`${apiEndpoint}/etablissement/${id}`, {
      headers: { Authorization: `${apiKey}` },
    });
    return true;
  } catch (error) {
    logger.error(error);
  }
};

const updateInformation = async (id) => {
  try {
    await axios.post(`${apiEndpoint}/service?job=etablissement&id=${id}`);
    return true;
  } catch (error) {
    logger.error(error);
  }
};

const createEtablissement = async (data) => {
  let etablissement = await postEtablissement(data);

  if (etablissement?._id) {
    await updateInformation(etablissement._id);
    etablissement = await getEtablissementById(etablissement._id);
  } else {
    // errors may be sent on http success
    logger.error("unable to create etablissement", etablissement);
    etablissement = null;
  }

  return etablissement;
};

module.exports = () => {
  return {
    getEtablissements: (opt) => getEtablissements(opt),
    getEtablissement: (opt) => getEtablissement(opt),
    getEtablissementById: (opt) => getEtablissementById(opt),
    postEtablissement: (opt) => postEtablissement(opt),
    deleteEtablissement: (opt) => deleteEtablissement(opt),
    updateInformation: (opt) => updateInformation(opt),
    createEtablissement: (opt) => createEtablissement(opt),
  };
};
