/**
 * Methodes liés aux tables de correspondances
 */
const logger = require("../logger");
const axios = require("axios");
const config = require("config");

const apiEndpoint = `${config.tableCorrespondance.endpoint}/api`;

module.exports = () => {
  return {
    getMefInfo: async (mef) => {
      try {
        const { data } = await axios.post(`${apiEndpoint}/mef`, {
          mef,
        });
        return data;
      } catch (error) {
        logger.error(`getMefInfo: something went wrong`);
        return null;
      }
    },
    getBcnInfo: async (options) => {
      let { page, limit, query } = { page: 1, limit: 10, ...options };
      let params = { page, limit, query };

      try {
        const { data } = await axios.get(`${apiEndpoint}/bcn/formationsDiplomes`, { params });
        return data;
      } catch (error) {
        logger.error(`getBcnInfo: something went wrong`);
        return null;
      }
    },
    getCfdInfo: async (cfd) => {
      try {
        const { data } = await axios.post(`${apiEndpoint}/cfd`, {
          cfd,
        });
        return data;
      } catch (error) {
        logger.error(`getCfdInfo: something went wrong`);
        return null;
      }
    },
    getCpInfo: async (codePostal) => {
      try {
        const { data } = await axios.post(`${apiEndpoint}/code-postal`, {
          codePostal,
        });
        return data;
      } catch (error) {
        logger.error(`getCpInfo: something went wrong`);
        return null;
      }
    },
    findOpcosFromCfd: async (cfd) => {
      try {
        const { data } = await axios.get(`${apiEndpoint}/opcos/opco?cfd=${cfd}`);
        return data;
      } catch (error) {
        logger.error(`findOpcosFromCfd: something went wrong`);
        return null;
      }
    },
  };
};
