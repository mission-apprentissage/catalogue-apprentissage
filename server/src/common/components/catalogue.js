const axios = require("axios");
const logger = require("../logger");
const config = require("config");
const methods = ["post", "put", "delete"];

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

const getEtablissements = async (options, chunckCallback = null) => {
  let { page, allEtablissements, limit, query } = { page: 1, allEtablissements: [], limit: 1050, ...options };
  let params = { page, limit, query };

  try {
    const response = await API.get(`/entity/etablissements`, { params });

    const { etablissements, pagination } = response.data;
    allEtablissements = allEtablissements.concat(etablissements);

    if (page < pagination.nombre_de_page) {
      if (chunckCallback) {
        await chunckCallback(allEtablissements);
        allEtablissements = [];
      }
      return getEtablissements({ page: page + 1, allEtablissements, limit }, chunckCallback);
    } else {
      if (chunckCallback) {
        await chunckCallback(allEtablissements);
        return [];
      }
      return allEtablissements;
    }
  } catch (error) {
    logger.error("Etablissements", error);
    throw new Error("unable to fetch Etablissements");
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

const countEtablissements = async (query = {}) => {
  try {
    const response = await API.get(`/entity/etablissements/count`, { params: { query } });
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

const createEtablissement = async (payload) => {
  if (!payload.siret) {
    logger.error("Missing siret from payload");
    return null;
  }

  try {
    const etablissement = await API.post(`/services/etablissement`, payload);
    return await postEtablissement(etablissement.data);
  } catch (error) {
    logger.error(error);
  }
};

module.exports = () => {
  return {
    getEtablissements: (opt, cb = null) => getEtablissements(opt, cb),
    getEtablissement: (opt) => getEtablissement(opt),
    countEtablissements: (opt) => countEtablissements(opt),
    getEtablissementById: (opt) => getEtablissementById(opt),
    postEtablissement: (opt) => postEtablissement(opt),
    deleteEtablissement: (opt) => deleteEtablissement(opt),
    createEtablissement: (opt) => createEtablissement(opt),
    updateEtablissement: (id, payload) => updateEtablissement(id, payload),
  };
};
