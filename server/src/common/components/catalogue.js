const axios = require("axios");
const logger = require("../logger");
const config = require("config");
const methods = ["post", "put", "delete"];

const API = axios.create({ baseURL: `${config.tableCorrespondance.endpoint}/api` });
API.interceptors.request.use(async (config) => {
  if (methods.includes(config.method)) {
    let token = await getToken();
    config.headers.authorization = `Bearer ${token}`;
  }
  return config;
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

const getEtablissements = async (options) => {
  let { page, allEtablissements, limit, query } = { page: 1, allEtablissements: [], limit: 1050, ...options };
  let params = { page, limit, query };

  try {
    const response = await API.get(`/entity/etablissements`, { params });

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
    const response = await API.get(`/entity/etablissement/`, { params: { query } });
    return response.data;
  } catch (error) {
    logger.error(error);
  }
};

const getEtablissementById = async (idEtablissement) => {
  try {
    const response = await API.get(`/entity/etablissement/${idEtablissement}`);
    return response.data;
  } catch (error) {
    logger.error(error);
  }
};

const postEtablissement = async (payload) => {
  try {
    const response = await API.post(`/entity/etablissement`, payload);
    return response.data;
  } catch (error) {
    logger.error(error);
  }
};

const updateEtablissement = async (id, payload) => {
  try {
    const response = await API.put(`/entity/etablissement/${id}`, payload);
    return response.data;
  } catch (error) {
    logger.error(error);
  }
};

const deleteEtablissement = async (id) => {
  try {
    await API.delete(`/entity/etablissement/${id}`);
    return true;
  } catch (error) {
    logger.error(error);
  }
};

const createEtablissement = async () => {
  /**
   * TODO (update whole function once TCO is updated by Antoine):
   * Generate etablissement object /api/service/etablissement
   * Post etablissement /api/entity/etablissement
   */
};

module.exports = () => {
  return {
    getEtablissements: (opt) => getEtablissements(opt),
    getEtablissement: (opt) => getEtablissement(opt),
    getEtablissementById: (opt) => getEtablissementById(opt),
    postEtablissement: (opt) => postEtablissement(opt),
    deleteEtablissement: (opt) => deleteEtablissement(opt),
    createEtablissement: (opt) => createEtablissement(opt),
    updateEtablissement: (id, payload) => updateEtablissement(id, payload),
  };
};
